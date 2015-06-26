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

module.exports.getUserToken = function(userId, token, callback){

  var key = generateRedisKey(userId, token);

  client.get(key, function(err, reply){
    if(err) return callback(err);
    if(!reply) {
      return callback({error:'Token not found!'});
    } else {
      //Touch the token TTL
      client.expire(key, TTL, function(err, rr){
        if(err) return callback(err);
        callback(null, JSON.parse(reply));
      });
    }
  });
};

module.exports.revokeUserToken = function(userId, token, callback){

  var key = generateRedisKey(userId, token);

  client.del(key, function(err, reply){
    if(err) return callback(err);
    return callback(null, {message:'Token revoked.'});
  });
};

function getAllKeys(pattern, callback) {

  var array = [];

  function cb(err, reply) {
    if(err) callback(err);

    console.log('************');
    console.log(reply);
    console.log('-------------');

    if(reply[1].length > 0) array.push.apply(array, reply[1]);

    var idx = parseFloat(reply[0]);
    if(idx !== 0) {
      client.scan(idx, 'match', pattern, cb);
    } else {
      callback(null, array);
    }
  }

  client.scan(0, 'match', pattern, cb);
}
module.exports.revokeAllUserTokens = function(userId, callback){

  getAllKeys(PREFIX+':'+userId+':*', function(err, keys){
    if(err) callback(err);
    console.log(keys);

    if(keys.length > 0) {
      client.del(keys, function(err, reply){
        if(err) return callback(err);
        console.log(reply);
        return callback(null, {message:'All tokens revoked.'});
      });
    } else {
      return callback(null, {message:'All tokens revoked.'});
    }

    //callback({error:'No token removed.'});
  });

};
