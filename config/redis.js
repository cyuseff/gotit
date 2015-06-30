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


/*
  Use Scan to get all keys with a pettern.
  TODO: uniqness of keys in the array is not sure.
*/
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
      client.SCAN(idx, 'match', pattern, cb);
    } else {
      callback(null, array);
    }
  }

  client.SCAN(0, 'match', pattern, cb);
}
/**/

module.exports.setUserToken = function(user, callback) {

  generateBuffer(function(err, buff){

    if(err) return callback(err);

    //Generate user token
    var token = generateToken({id:user._id, key:buff});

    //Generate redis key
    var key = generateRedisKey(user._id, buff);
    var setKey = generateRedisKey('all', user._id);

    //set key with TTL
    client.multi()
      .SETEX(key, TTL, JSON.stringify(user))
      .SADD(setKey, key)
      .exec(function(err, reply) {
        if(err) return callback(err);
        return callback(null, token);
      });
  });
};

module.exports.getUserToken = function(userId, token, callback){

  var key = generateRedisKey(userId, token);

  //Single call
  client.multi()
    .GET(key)
    .EXPIRE(key, TTL)
    .exec(function(errs, reply){
      if(errs) return callback(errs);

      if(reply && reply[0]) {
        return callback(null, JSON.parse(reply[0]));
      } else {
        callback({error:'Token not found!'});

        /*DEL token from set*/
        var setKey = generateRedisKey('all', userId);
        client.SREM(setKey, key, function(err, reply){
          if(err) return console.log(err);
          console.log(reply);
        });
      }
    });
};

module.exports.revokeUserToken = function(userId, token, callback){

  var key = generateRedisKey(userId, token);
  var setKey = generateRedisKey('all', userId);

  client.multi()
    .DEL(key)
    .SREM(setKey, key)
    .exec(function(err, reply) {
      if(err) return callback(err);
      return callback(null, {message:'Token revoked.'});
    });
};

module.exports.revokeAllUserTokens = function(userId, callback){

  var setKey = generateRedisKey('all', userId);

  client.SMEMBERS(setKey, function(err, keys) {
    keys.push(setKey);

    client.DEL(keys, function(err, reply){
      if(err) return callback(err);
      return callback(null, {message:'All tokens revoked.'});
    })
  });

};
