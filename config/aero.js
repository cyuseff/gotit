'use strict';

var aerospike = require('aerospike')
  , status = aerospike.status;


// Connect to the cluster.
var client = aerospike.client({
  hosts: [ { addr: '127.0.0.1', port: 3000 } ]
});

function connectCb(err, client) {
  if(err.code == status.AEROSPIKE_OK) {
    console.log('Aerospike Connection Success');

    /* Register Lua modules */
    client.udfRegister(__dirname + '/udf/scripts.lua', function(err) {
      if(err.code !== status.AEROSPIKE_OK) return console.log(err);
      console.log('Lua registered!');
    });

  }
}

client.connect(connectCb);

module.exports = {
  aero: aerospike,
  client: client
};
