"use strict";

var mongoose = require('mongoose');
var dbURI = 'mongodb://localhost/got-it';
//if(process.env.NODE_ENV == 'production') dbURI = process.env.MONGOLAB_URI;
mongoose.connect(dbURI);




mongoose.connection.on('connected', function(){
	console.log('Mongoose connected to: '+dbURI);
});

mongoose.connection.on('error', function(err){
	console.log('Mongoose connected error: '+err);
});

mongoose.connection.on('disconected', function(){
	console.log('Mongoose disconected');
});


var gracefulShutdown = function(msg, callback){
	mongoose.connection.close(function(){
		console.log('Mongoose disconnected through ' + msg);
		callback();
	});
};

/*Close mongodb connection*/
process.on('SIGINT', function(){
	gracefulShutdown('app termination', function(){
		process.exit(0);
	});
});
process.on('SIGTERM', function(){
	gracefulShutdown('Heroku app shutdown', function(){
		process.exit(0);
	});
});

require('./user');
