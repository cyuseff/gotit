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
    console.log(__dirname);
    client.udfRegister(__dirname + '/udf/scripts.lua', function(err) {
      // check for err.code in the callback function.
      // AEROSPIKE_OK signifies UDF register request has been submitted to the server.
      if(err.code !== status.AEROSPIKE_OK) {
        console.log(err);
      } else {
        console.log('Lua registered!');
      }
    });

  }
}

client.connect(connectCb);

module.exports = {
  aero: aerospike,
  client: client
};
