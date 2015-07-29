'use strict';

var redis = require('../../config/redis')
  , crypto = require('crypto')
  , jwt = require('jsonwebtoken')
  , env = require('../../config/env')
  , SECRET = env.JWT_SECRET
  , NAME_SPACE = env.NAME_SPACE
  , SET_PREFIX = env.SET_PREFIX
  , TTL = 3600// 360
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

function generateRedisKey(prefix, primaryKey, secondaryKey) {
  var key = NAME_SPACE + ':' + prefix + ':' + primaryKey;
  if(secondaryKey) key += ':' + secondaryKey;
  return key;
}

/*
  Token Model:
    prefix:         (string, required)
    id:             (string, required)
    data:           (required)

    key:            (string) redis key generated after save.
    jwToken:    (string) public jwt generated after save. You should return this to end user.

    setKey:         (string) if setted, the token will belong to a static set.
                      This will be helpfull when dealing with token that not belong to a specific model.
                      Ex: 'reset-pasword' => got-it:user:set:reset-pasword
                      Default: NAME_SPACE + prefix + SET_PREFIX + id => got-it:user:set:user_id

    expire:         (boolean) default false.
    ttl:            (int) default TTL.
*/
function Token(opts) {
  if(!opts.prefix || !opts.id || !opts.data) return null;

  this.prefix = opts.prefix;
  this.id = opts.id;
  this.data = opts.data;
  this.createdAt = Date.now();

  this.key = opts.key || null;
  this.jwToken = opts.jwToken || null;

  // options
  this.setKey = opts.setKey || null;
  this.expire = opts.expire || false;
  this.ttl = (!isNaN(opts.ttl))? opts.ttl : TTL;
}

// Private Methods
function _findToken(prefix, id, set, buff, touch, callback) {
  var key = generateRedisKey(prefix, id, buff)
    , setKey = generateRedisKey(prefix, SET_PREFIX, set)
    , script;

  script = '\
  local token = redis.call("GET", KEYS[1]) \
  if token then \
    if ARGV[1] == "true" then \
      local json = cjson.decode(token) \
      if json.expire then \
        redis.call("EXPIRE", KEYS[1], json.ttl) \
      end \
    end \
    return token \
  else \
    redis.call("SREM", KEYS[2], KEYS[1]) \
    return nil \
  end';

  redis.EVAL(script, 2, key, setKey, touch, function(err, token) {
    if(err) return callback(err);
    if(!token) {
      // We asume that Token has expire, so DEL token from SET
      // checkTokensInSet(userId);
      return callback({error: 'Token not found.', status: 404});
    }
    return callback(null, JSON.parse(token));
  });
}

// Static Methods

/*
  token:    (string) jwt
  callback: (fn)
  touch:    (boolean) if true, will try to update TTL on expirable tokens, default false.
  verifyFn: (fn) expect to return a boolean value, default true.
            It will also recibe token and decoded token as arguments, ex:
              function(token, decoded){ return tru}
*/
Token.findByJwt = function(jwToken, callback, touch, verifyFn) {
  touch = touch || false;
  verifyFn = verifyFn || null;

  jwt.verify(jwToken, SECRET, function(err, decoded) {
    if(err) {
      return callback({error: 'Token is not valid.', status: 400});
    } else {
      _findToken(decoded.prefix, decoded.id, decoded.set, decoded.key, touch, function(err, token) {
        if(err) return callback(err);
        // Exec validate verifyFn if setted (should return true)
        if(verifyFn) {
          if(verifyFn(token, decoded)) {
            return callback(null, token);
          } else {
            return callback({error: 'Bad token.', status: 400});
          }
        } else {
          return callback(null, token);
        }
      });
    }
  });
};

Token.removeByJwt = function(jwToken, callback) {
  jwt.verify(jwToken, SECRET, function(err, decoded) {
    var key = generateRedisKey(decoded.prefix, decoded.id, decoded.key)
      , setKey = generateRedisKey(decoded.prefix, SET_PREFIX, decoded.set);

    redis.multi()
      .DEL(key)
      .SREM(setKey, key)
      .exec(function(err, reply) {
        if(err) return callback(err);
        if(!reply[0]) return callback({error: 'Token not found', status: 404});
        return callback(null, {message: 'Token removed'});
      });
  });
};

Token.findAllInSet = function(prefix, set, callback) {
  var setKey = generateRedisKey(prefix, SET_PREFIX, set)
    , tokens = []
    , script;

  script = 'local keys = redis.call("SMEMBERS", KEYS[1]) if table.getn(keys)==0 then return {} else return redis.call("MGET", unpack(keys)) end';

  redis.EVAL(script, 1, setKey, function(err, reply) {
    if(err) return callback(err);
    for(var i=0, l=reply.length; i<l; i++) {
      if(!reply[i]) continue;
      tokens.push(JSON.parse(reply[i]));
    }
    return callback(null, tokens);
  });
};

Token.updateAllInSet = function(prefix, set, data, callback) {
  var setKey = generateRedisKey(prefix, SET_PREFIX, set)
    , script;

  data = JSON.stringify(data);
  script = '\
    local json \
    local ttl \
    local keys = redis.call("SMEMBERS", KEYS[1]) \
    if table.getn(keys) == 0 then return keys end \
    for i, k in ipairs(keys) do \
      ttl = redis.call("TTL", k) \
      if ttl<0 then \
        if ttl == -2 then \
          redis.call("SREM", KEYS[1], k) \
        else \
          json = cjson.decode(redis.call("GET", k)) \
          json.data = cjson.decode(ARGV[1]) \
          redis.call("SET", k, cjson.encode(json)) \
        end \
      else \
        json = cjson.decode(redis.call("GET", k)) \
        json.data = cjson.decode(ARGV[1]) \
        redis.call("SETEX", k, ttl, cjson.encode(json)) \
      end \
    end \
    return redis.call("SMEMBERS", KEYS[1])';

  redis.EVAL(script, 1, setKey, data, function(err, reply) {
    if(err) return callback(err);
    return callback(null, reply);
  });
};

Token.removeAllInSet = function(prefix, set, callback) {
  var setKey = generateRedisKey(prefix, SET_PREFIX, set)
    , script;

  script = 'local keys = redis.call("SMEMBERS", KEYS[1]) if table.getn(keys)==0 then return nil else table.insert(keys, KEYS[1]) return redis.call("DEL", unpack(keys)) end';

  redis.EVAL(script, 1, setKey, function(err, reply) {
    if(err) return callback(err);
    if(!reply) return callback({error: 'Set not found.', status: 404});
    return callback(null, reply);
  });
};

// Instance Methods
// Calling Token.save on already saved Token, will always update the TTL if is enabled
Token.prototype.save = function(callback) {
  var me = this;

  function save() {
    var multi = redis.multi();
    multi
      .SET(me.key, JSON.stringify(me))
      .SADD(me.setKey, me.key);

    // Set the TTL on key
    if(me.expire) multi.EXPIRE(me.key, me.ttl);

    multi.exec(function(err, reply) {
      if(err) return callback(err);
      return callback(null, me.jwToken);
    });
  }

  // New Token
  if(!me.jwToken) {
    generateBuffer(function(err, buff) {
      if(err) return callback(err);

      // Generate user token
      me.jwToken = generateToken({
        id: me.id,
        key: buff,
        prefix: me.prefix,
        set: me.setKey || me.id
      });

      // Generate redis key
      me.key = generateRedisKey(me.prefix, me.id, buff);
      me.setKey = (me.setKey !== null)? generateRedisKey(me.prefix, SET_PREFIX, me.setKey)
                                      : generateRedisKey(me.prefix, SET_PREFIX, me.id);
      save();
    });
  } else {
    save();
  }
};

module.exports = Token;
