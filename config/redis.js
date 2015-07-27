'use strict';

var redis = require('redis')
  , client = redis.createClient();


/* Conection Events */
client.on('error', function(err) {
  console.log('Error ' + err);
});

client.on('connect', function() {
  // console.log('Redis is ready');
});

module.exports = client;
