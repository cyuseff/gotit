'use strict';

var aerospike = require('../../config/aero').aero
  , aero = require('../../config/aero').client
  , status = aerospike.status
  , crypto = require('crypto')
  , jwt = require('jsonwebtoken')
  , env = require('../../config/env')
  , SECRET = env.JWT_SECRET
  , NAMESPACE = 'test'
  , TTL = -1
  , TOKEN_LENGTH = 32;

function generateBuffer(callback) {
  crypto.randomBytes(TOKEN_LENGTH, function(ex, buf) {
    if(ex) return callback(ex);
    callback(null, buf.toString('hex'));
  });
}

function generateToken(data) {
  data.timeStamp = Date.now();
  return jwt.sign(data, SECRET, {});
}

function generateAeroKey(set, primaryKey) {
  if(primaryKey) {
    return aerospike.key(NAMESPACE, set, primaryKey);
  } else {
    return aerospike.key(NAMESPACE, set);
  }
}

// id is a reference used for secondary index, change his name to sid?
// key is the primary key in aerospace, chage to pk
/*
  Token Model:
    set:            (string, required) aerospike set
    sid:            (string, required) aerospike secondary index
    data:           (required)

    key:            (string) aerospike primary key
    jwToken:        (string) public jwt generated after save. You should return this to end user.

    ttl:            (int) default 0.
*/
function Token(opts) {
  if(!opts.set || !opts.sid || !opts.data) return null;

  this.set = opts.set;
  this.sid = opts.sid;
  this.data = JSON.stringify(opts.data);
  this.createdAt = Date.now();
  this.key = opts.key || null;
  this.jwToken = opts.jwToken || null;
  this.ttl = (!isNaN(opts.ttl))? opts.ttl : TTL;
}

// Private Methods
function _findToken(set, buff, touch, callback) {
  var key = generateAeroKey(set, buff);

  if(touch) {
    var udf = {
      module: 'scripts',
      funcname: 'getAndTouchRecord'
    };
    aero.execute(key, udf, function(err, record) {
      if(err.code !== status.AEROSPIKE_OK) return callback(err.message);
      if(record === null) return callback({error: 'Token not found.', status: 404});
      return callback(null, record);
    });
  } else {
    aero.get(key, function(err, record, meta) {
      if(err.code === status.AEROSPIKE_ERR_RECORD_NOT_FOUND) return callback({error: 'Token not found.', status: 404});
      if(err.code !== status.AEROSPIKE_OK) return callback(err.message);
      return callback(null, record, meta);
    });
  }
}

// Static Methods

/*
  token:    (string) jwt
  callback: (fn)
  touch:    (boolean) if true, will try to update TTL on expirable tokens, default false.
  verifyFn: (fn) if setted, expect to return a boolean value.
            It will recibe token (redis object) and decoded (jwt info) token as arguments.
            This will let you compare if the info inside the public token is eql to the one
            stored inside redis.
            ex:
              function(token, decoded){ return true; }
*/
Token.findByJwt = function(jwToken, callback, touch, verifyFn) {
  touch = touch || false;
  verifyFn = verifyFn || null;

  jwt.verify(jwToken, SECRET, function(err, decoded) {
    if(err) {
      return callback({error: 'Token is not valid.', status: 400});
    } else {
      _findToken(decoded.set, decoded.key, touch, function(err, token, meta) {
        if(err) return callback(err);
        // parse json data
        token.data = JSON.parse(token.data);
        // Exec validate verifyFn if setted (should return true)
        if(verifyFn) {
          if(verifyFn(token, decoded)) {
            return callback(null, token, meta);
          } else {
            return callback({error: 'Bad token.', status: 400});
          }
        } else {
          return callback(null, token, meta);
        }
      });
    }
  });
};

Token.removeByJwt = function(jwToken, callback) {
  jwt.verify(jwToken, SECRET, function(err, decoded) {
    var key = generateAeroKey(decoded.set, decoded.key);

    aero.remove(key, function(err, key) {
      if(err.code === aerospike.status.AEROSPIKE_ERR_RECORD_NOT_FOUND) return callback({error: 'Token not found', status: 404});
      if(err.code !== aerospike.status.AEROSPIKE_OK) return callback(err.message);
      return callback(null, {message: 'Token removed'});
    });
  });
};

function getAllKeysInSetBySid(set, sid, callback) {
  var filter, args, query, stream, tokens;

  filter = aerospike.filter;
  args = {
    nobins: false,
    concurrent: true,
    filters: [filter.equal('sid', sid)]
  };

  tokens = [];
  query = aero.query(NAMESPACE, set, args);
  stream = query.execute();
  stream
    .on('error', function(err) { console.log(err); })
    .on('data', function(rec) { tokens.push(rec.bins); })
    .on('end', function(rec) { callback(tokens); });
}

function batchUpdate(set, tokens, data, callback) {
  var scaned = 0
    , updated = 0
    , token;
  var cb = function(err, reply) {
    scaned++;
    if(err.code === aerospike.status.AEROSPIKE_OK) updated++;
    if(scaned === tokens.length) callback(null, {scaned: scaned, updated: updated});
  };

  var udf = {
    module: 'scripts',
    funcname: 'updateRecord',
    args: [JSON.stringify(data)]
  };

  for(var i=0, l=tokens.length; i<l; i++) {
    token = tokens[i];
    if(token.ttl > 0) {
      aero.execute(generateAeroKey(set, tokens[i].key), udf, cb);
    } else {
      token.data = JSON.stringify(data);
      aero.put(generateAeroKey(set, tokens[i].key), token, cb);
    }
  }
}
function batchRemove(set, tokens, callback) {
  var scaned = 0
    , removed = 0;
  var cb = function(err) {
    scaned++;
    if(err.code === aerospike.status.AEROSPIKE_OK) removed++;
    if(scaned === tokens.length) callback(null, {scaned: scaned, removed: removed});
  };
  for(var i=0, l=tokens.length; i<l; i++) aero.remove(generateAeroKey(set, tokens[i].key), cb);
}

Token.findAllInSetBySid = function(set, sid, callback) {
  getAllKeysInSetBySid(set, sid, function(tokens) { callback(null, tokens); });
};

Token.updateAllInSetBySid = function(set, sid, data, callback) {
  getAllKeysInSetBySid(set, sid, function(tokens) {
    if(tokens.length) return batchUpdate(set, tokens, data, callback);
    return callback(null, {scaned: 0, updated: 0});
  });
};

Token.removeAllInSetbySid = function(set, sid, callback) {
  getAllKeysInSetBySid(set, sid, function(tokens) {
    if(tokens.length) return batchRemove(set, tokens, callback);
    return callback(null, {scaned: 0, removed: 0});
  });
};


// Instance Methods
// Calling Token.save on already saved Token, will always update the TTL if is enabled
Token.prototype.save = function(callback) {
  var me = this;

  function save(key) {
    aero.put(key, me, {ttl: me.ttl}, function(err, k) {
      if(err.code !== aerospike.status.AEROSPIKE_OK) return callback(err.message, null);
      return callback(null, me.jwToken);
    });
  }

  // New Token
  if(!me.jwToken) {
    generateBuffer(function(err, buff) {
      if(err) return callback(err);
      me.key = buff;
      // Generate public token
      me.jwToken = generateToken({
        sid: me.sid,
        key: buff,
        set: me.set
      });

      // Generate aero key and save
      save(generateAeroKey(me.set, buff));
    });
  } else {
    save(generateAeroKey(me.set, me.key));
  }
};

module.exports = Token;
