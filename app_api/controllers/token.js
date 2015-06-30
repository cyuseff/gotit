"use strict";

var redis = require('../../config/redis')
  , crypto = require('crypto')
  , jwt = require('jsonwebtoken')
  , SECRET = 'my-cool-secret'
  , PREFIX = 'token'
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
  var key = PREFIX + ':' + primaryKey;
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
    var setKey = generateRedisKey('all', user._id);

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

        //TODO: create check all Keys method to remove all deleted keys from SET
        // We asume that Token has expire, so DEL token from SET
        var setKey = generateRedisKey('all', userId);
        redis.SREM(setKey, key, function(err, reply){
          console.log(err, reply);
        });
      }
    });
}
module.exports.getUserToken = getUserToken;

module.exports.revokeUserToken = function(userId, token, callback){

  var key = generateRedisKey(userId, token);
  var setKey = generateRedisKey('all', userId);

  redis.multi()
    .DEL(key)
    .SREM(setKey, key)
    .exec(function(err, reply) {
      if(err) return callback(err);
      return callback(null, {message:'Token revoked.'});
    });
};

module.exports.revokeAllUserTokens = function(userId, callback){

  var setKey = generateRedisKey('all', userId);

  redis.SMEMBERS(setKey, function(err, keys) {
    keys.push(setKey);

    redis.DEL(keys, function(err, reply){
      if(err) return callback(err);
      return callback(null, {message:'All tokens revoked.'});
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
          //req.user = user;
          //next();
          return callback(null, user);
        } else {
          //return sendJsonResponse(res, 400, {error: 'Bad token.'});
          return callback({error: 'Bad token.'});
        }

      });

    }
  });
};
