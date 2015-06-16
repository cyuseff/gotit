"use strict";

var redis = require('redis')
  , crypto = require('crypto')
  , jwt = require('jsonwebtoken')
  , util = require("util")
  , client = redis.createClient()
  , SECRET = 'my-cool-secret'
  , PREFIX = 'token'
  , TTL = 360
  , TOKEN_LENGTH = 32;


/* Conection Events */
client.on('error', function (err) {
  console.log('Error ' + err);
});

client.on('connect', function () {
  console.log('Redis is ready');
});

module.exports.client = client;

var generateBuffer = function(callback){
  crypto.randomBytes(TOKEN_LENGTH, function(ex, buf) {
    if (ex) callback(ex);

    if (buf) {
      callback(null, buf.toString('hex'));
    } else {
      callback(new Error('Problem when generating buf'));
    }
  });
};

var generateToken = function(data) {
  data.timeStamp = Date.now();
  return jwt.sign(data, SECRET, {});
};

var generateRedisKey = function(primaryKey, secondaryKey) {
  var key = PREFIX + ':' + primaryKey;
  if(secondaryKey) key += ':'+secondaryKey;
  return key;
};

module.exports.setUserToken = function(user, callback) {

  generateBuffer(function(err, buff){

    if(err) return callback(err);

    //Generate user token
    var token = generateToken({id:user._id, key:buff});

    //Generate redis key
    var key = generateRedisKey(buff, user._id);

    client.set(key, JSON.stringify(user), function(err, reply){
      if(err) return callback(err);

      if(reply) {
        client.expire(key, TTL, function(err, reply){
          if(err) return callback(err);
          callback(null, token);
        });
      }

    });

  });
};

module.exports.getUserToken = function(token, userId, callback){

  var key = generateRedisKey(token, userId);

  client.get(key, function(err, reply){
    if(err) return callback(err);
    if(!reply) {
      return callback({message:'Token not found!'});
    } else {
      //Touch the token TTL
      client.expire(key, TTL, function(err, rr){
        if(err) return callback(err);
        callback(null, JSON.parse(reply));
      });
    }
  });
};

module.exports.revokeUserToken = function(token, userId, callback){
  var key = generateRedisKey(token, userId);

  client.del(key, function(err, reply){
    if(err) return callback(err);
    if(reply) {
      return callback(null, {message:'Token revoked.'});
    } else {
      return callback(null, {message:'Token not found.'});
    }

  });
};
