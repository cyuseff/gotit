'use strict';

var redis = require('../../config/redis')
  , crypto = require('crypto')
  , jwt = require('jsonwebtoken')
  , SECRET = 'my-cool-secret'
  , NAME_SPACE = 'got-it'
  , SET_PREFIX = 'set'
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
    publicToken:    (string) public jwt generated after save. You should return this to end user.

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
  this.publicToken = opts.publicToken || null;

  // options
  this.setKey = opts.setKey || null;
  this.expire = opts.expire || false;
  this.ttl = (!isNaN(opts.ttl))? opts.ttl : TTL;
}

// Private Methods
function _findToken(prefix, id, buff, touch, callback) {
  touch = touch || false;

  var key = generateRedisKey(prefix, id, buff)
    , script;

  script = '\
  local token = redis.call("GET", KEYS[1]) \
  if token then \
    if ARGV[1] then \
      local json = cjson.decode(token) \
      if json.expire then \
        redis.call("EXPIRE", KEYS[1], json.ttl) \
      end \
    end \
    return token \
  else \
    return nil \
  end';

  redis.EVAL(script, 1, key, touch, function(err, token) {
    if(err) return callback(err);
    if(!token) {
      // We asume that Token has expire, so DEL token from SET
      // checkTokensInSet(userId);
      return callback(null, null);
    }
    return callback(null, new Token(JSON.parse(token)));
  });
}

// Static Methods
Token.findAndValidate = function(token, callback, touch, fn) {

  touch = touch || false;
  fn = fn || null;

  jwt.verify(token, SECRET, function(err, decoded) {
    if(err) {
      return callback({error: 'Token is not valid.'});
    } else {
      _findToken(decoded.prefix, decoded.id, decoded.key, touch, function(err, token) {
        if(err) return callback(err);
        // Token exist on redis
        /*if(user && user._id === decoded.id) {
          return callback(null, user);
        } else {
          return callback({error: 'Bad token.'});
        }*/

        // Exec validate fn if setted (should return true)
        if(fn) {
          if(fn(token, decoded)) {
            return callback(null, token);
          } else {
            return callback(null, {error: 'Bad token.'});
          }
        } else {
          return callback(null, token);
        }
      });
    }
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
      return callback(null, me.publicToken);
    });
  }

  // New Token
  if(!me.publicToken) {
    generateBuffer(function(err, buff) {
      if(err) return callback(err);

      // Generate user token
      me.publicToken = generateToken({id: me.id, key: buff, prefix: me.prefix});

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
