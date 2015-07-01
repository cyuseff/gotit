"use strict";

var redis = require('../../config/redis')
  , crypto = require('crypto')
  , jwt = require('jsonwebtoken')
  , SECRET = 'my-cool-secret'
  , NAME_SPACE = 'got-it'
  , PREFIX = 'token'
  , SET_PREFIX = 'user-set'
  , TTL = 360
  , TOKEN_LENGTH = 32;

function generateBuffer(callback) {
  crypto.randomBytes(TOKEN_LENGTH, function(ex, buf) {
    if (ex) return callback(ex);

    if (buf) {
      callback(null, buf.toString('hex'));
    } else {
      callback({error:'Problem generating buf'});
    }
  });
}

function generateToken(data) {
  data.timeStamp = Date.now();
  return jwt.sign(data, SECRET, {});
}

function generateRedisKey(primaryKey, secondaryKey) {
  var key = NAME_SPACE + ':' + PREFIX + ':' + primaryKey;
  if(secondaryKey) key += ':'+secondaryKey;
  return key;
}

module.exports.setUserToken = function(user, callback) {

  generateBuffer(function(err, buff){

    if(err) return callback(err);

    //Generate user token
    var token = generateToken({id:user._id, key:buff});

    //Generate redis key
    var key = generateRedisKey(user._id, buff);
    var setKey = generateRedisKey(SET_PREFIX, user._id);

    //set key with TTL
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
    , tmp = [];

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
}

function getUserToken(userId, token, callback) {
  var key = generateRedisKey(userId, token);
  redis.multi()
    .GET(key)
    .EXPIRE(key, TTL)
    .exec(function(errs, reply){
      if(errs) return callback(errs);

      if(reply && reply[0]) {
        return callback(null, JSON.parse(reply[0]));
      } else {
        callback({error:'Token not found!'});

        // We asume that Token has expire, so DEL token from SET
        /*var setKey = generateRedisKey('all', userId);
        redis.SREM(setKey, key, function(err, reply){
          console.log(err, reply);
        });*/
        checkTokensInSet(userId);
      }
    });
}

module.exports.revokeUserToken = function(token, callback){

  jwt.verify(token, SECRET, function(err, decoded){
    if(err) return callback(err);

    var key = generateRedisKey(decoded.id, decoded.key);
    var setKey = generateRedisKey(SET_PREFIX, decoded.id);

    redis.multi()
      .DEL(key)
      .SREM(setKey, key)
      .exec(function(err, reply) {
        if(err) return callback(err);
        return callback(null, {message:'Token revoked.'});
      });
        
  });
};

module.exports.revokeAllUserTokens = function(userId, callback){

  var setKey = generateRedisKey(SET_PREFIX, userId);

  redis.SMEMBERS(setKey, function(err, keys) {
    keys.push(setKey);

    redis.DEL(keys, function(err, reply){
      if(err) return callback(err);
      return callback(null, {message: 'All tokens revoked.', info: reply});
    })
  });

};

module.exports.validateToken = function(token, callback) {
  jwt.verify(token, SECRET, function(err, decoded){
    if(err) {
      console.log(err);
      return callback({error: 'Token is not valid.'});
    } else {

      //check if token exist
      getUserToken(decoded.id, decoded.key, function(err, user){
        if(err) return callback(err);

        //Token exist on redis
        if(user._id === decoded.id) {
          return callback(null, user);
        } else {
          return callback({error: 'Bad token.'});
        }

      });

    }
  });
};
