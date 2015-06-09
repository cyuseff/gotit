"use strict";

var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/token';
//if(process.env.NODE_ENV == 'production') dbURI = process.env.MONGOLAB_URI;
mongoose.connect(dbURI);

/** Events **/
mongoose.connection
	.on('connected', function(){
		//console.log('Mongoose connected to: '+dbURI);
	})
	.on('error', function(err){
		console.log('Mongoose connected error: '+err);
	})
	.on('disconected', function(){
		console.log('Mongoose disconected');
	});


var gracefulShutdown = function(msg, callback){
	mongoose.connection.close(function(){
		console.log('Mongoose disconnected through ' + msg);
		callback();
	});
};

/*Close mongodb connection*/
process
	.on('SIGINT', function(){
		gracefulShutdown('app termination', function(){
			process.exit(0);
		});
	})
	.on('SIGTERM', function(){
		gracefulShutdown('Heroku app shutdown', function(){
			process.exit(0);
		});
	});

module.exports = mongoose;
