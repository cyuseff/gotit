'use strict';

var redis = require('redis');
var servers = [
  {
    port: 6379,
    host: '127.0.0.1',
    type: null,
    client: null
  },
  {
    port: 8000,
    host: '127.0.0.1',
    type: null,
    client: null
  }
];

function conectionHandler(clientId) {
  console.log('connect', clientId);
  console.log( servers[clientId].client );
  servers[clientId].client.get('test', function(err, reply) {
    console.log(err, reply);
  });
}

for(var i=0, l=servers.length; i<l; i++) {
  servers[i].client = redis.createClient(servers[i].port, servers[i].host, {});

  (function(i){
    servers[i].client.on('connect', function() { conectionHandler(i); });
  })(i)
}


/* Conection Events */
/*client.on('error', function(err) {
  console.log('Error ' + err);
});

client.on('connect', function() {
  console.log('Redis is ready');
});*/

module.exports = servers[0].client;
