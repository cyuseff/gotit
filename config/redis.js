'use strict';

var redis = require('redis')
  , client = redis.createClient();


/* Conection Events */
client.on('error', function(err) {
  console.log('Error ' + err);
});

client.on('connect', function() {
  console.log('Redis is ready');
});

module.exports = client;


/*
  Use Scan to get all keys with a pettern.
  TODO: uniqness of keys in the array is not sure.
*/
/*function getAllKeys(pattern, callback) {

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
*/
