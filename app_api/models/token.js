'use strict';

var redis = require('../../config/redis')
  , crypto = require('crypto')
  , jwt = require('jsonwebtoken')
  , SECRET = 'my-cool-secret'
  , NAME_SPACE = 'got-it'
  , PREFIX = 'token'
  , SET_PREFIX = 'user-set'
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

function generateRedisKey(primaryKey, secondaryKey) {
  var key = NAME_SPACE + ':' + PREFIX + ':' + primaryKey;
  if(secondaryKey) key += ':' + secondaryKey;
  return key;
}

module.exports.setUserToken = function(user, callback) {

  generateBuffer(function(err, buff) {

    if(err) return callback(err);

    // Generate user token
    var token = generateToken({ id: user._id, key: buff });

    // Generate redis key
    var key = generateRedisKey(user._id, buff);
    var setKey = generateRedisKey(SET_PREFIX, user._id);

    // Set key with TTL
    redis.multi()
      .SETEX(key, TTL, JSON.stringify(user))
      .SADD(setKey, key)
      .exec(function(err, reply) {
        if(err) return callback(err);
        return callback(null, token);
      });
  });
};

function checkTokensInSet(userId) {
  var setKey = generateRedisKey(SET_PREFIX, userId)
    , tmp = []
    , script;

  script = '\
    local reply \
    local keys = redis.call("SMEMBERS", KEYS[1]) \
    if table.getn(keys) == 0 then return keys end \
    for i, k in ipairs(keys) do \
      reply = redis.call("EXISTS", k) \
      if reply==false then redis.call("SREM", KEYS[1], k) end \
    end \
    return redis.call("SMEMBERS", KEYS[1])';

  redis.EVAL(script, 1, setKey, function(err, reply) {
    if(err) return console.log(err);
    return console.log(reply);
  });

  /*
  redis.SMEMBERS(setKey, function(err, keys) {
    if(err) return console.log(err);
    if(!keys) return console.log('Set not exist');

    var multi = redis.multi();
    for(var i=0, l=keys.length; i<l; i++) multi.EXISTS(keys[i]);

    multi.exec(function(err, reply) {
      if(err) return console.log(err);

      for(i=0; i<l; i++) if(reply[i] === 0) tmp.push(keys[i]);
      if(tmp.length > 0) redis.SREM(setKey, tmp);
    });
  });
  */
}

function getUserToken(userId, token, callback) {
  var key = generateRedisKey(userId, token);
  redis.multi()
    .GET(key)
    .EXPIRE(key, TTL)
    .exec(function(err, reply) {
      if(err) return callback(err);

      if(reply && reply[0]) {
        return callback(null, JSON.parse(reply[0]));
      } else {
        callback({error: 'Token not found!'});

        // We asume that Token has expire, so DEL token from SET
        /* var setKey = generateRedisKey('all', userId);
        redis.SREM(setKey, key, function(err, reply){
          console.log(err, reply);
        }); */
        checkTokensInSet(userId);
      }
    });
}

module.exports.revokeUserToken = function(token, callback) {
  jwt.verify(token, SECRET, function(err, decoded) {
    if(err) return callback(err);

    var key = generateRedisKey(decoded.id, decoded.key);
    var setKey = generateRedisKey(SET_PREFIX, decoded.id);

    redis.multi()
      .DEL(key)
      .SREM(setKey, key)
      .exec(function(err, reply) {
        if(err) return callback(err);
        return callback(null, {message: 'Token revoked.'});
      });

  });
};

module.exports.revokeAllUserTokens = function(userId, callback) {
  var setKey = generateRedisKey(SET_PREFIX, userId);

  redis.SMEMBERS(setKey, function(err, keys) {
    keys.push(setKey);

    redis.DEL(keys, function(err, reply) {
      if(err) return callback(err);
      return callback(null, {message: 'All tokens revoked.', info: reply});
    });
  });

};

module.exports.updateAllUserTokens = function(userId, user, callback) {
  var setKey = generateRedisKey(SET_PREFIX, userId)
    , tmp = []
    , script;

  user = JSON.stringify(user);

  script = '\
    local ttl \
    local keys = redis.call("SMEMBERS", KEYS[1]) \
    if table.getn(keys) == 0 then return keys end \
    for i, k in ipairs(keys) do \
      ttl = redis.call("TTL", k) \
      if ttl<0 then \
        if ttl == -1 then redis.call("DEL", k) end \
        redis.call("SREM", KEYS[1], k) \
      else redis.call("SETEX", k, ttl, ARGV[1]) end \
    end \
    return redis.call("SMEMBERS", KEYS[1])';

  redis.EVAL(script, 1, setKey, user, function(err, reply) {
    if(err) return callback(err);
    return callback(null, reply);
  });

  /*redis.SMEMBERS(setKey, function(err, keys) {
    if(err) return callback(err);
    if(!keys) return callback(null, null);

    var multi = redis.multi();
    for(var i=0, l=keys.length; i<l; i++) multi.SET(keys[i], user, 'XX');

    multi.exec(function(err, reply) {
      if(err) return callback(err);

      // check if any key has expire
      for(i=0; i<l; i++) if(!reply[i]) tmp.push(keys[i]);
      if(tmp.length) {
        redis.SREM(setKey, tmp, function(err) {
          console.log('Set updated!');
          return callback(null, reply);
        });
      } else {
        return callback(null, reply);
      }
    });

  });*/
};

module.exports.validateToken = function(token, callback) {
  jwt.verify(token, SECRET, function(err, decoded) {
    if(err) {
      console.log(err);
      return callback({error: 'Token is not valid.'});
    } else {
      // Check if token exist
      getUserToken(decoded.id, decoded.key, function(err, user) {
        if(err) return callback(err);

        // Token exist on redis
        if(user && user._id === decoded.id) {
          return callback(null, user);
        } else {
          return callback({error: 'Bad token.'});
        }

      });

    }
  });
};
