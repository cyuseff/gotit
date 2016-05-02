'use strict';

const mongoose = require('mongoose');
const DB_URI = (process.env.NODE_ENV == 'production')? process.env.MONGO_URI : 'mongodb://localhost/gotit';

mongoose.connection
  //.on('connected', () => console.log(`Mongo connected to: ${DB_URI}`))
  .on('error', err => console.log(`Mongo connection error: ${err}`))
  .on('disconected', () => 'Mongo disconected');

function gracefulShutdown(msg, cb) {
	mongoose.connection.close(() => {
		console.log(`Mongoose disconnected through ${msg}`);
		cb();
	});
}

/*Close mongodb connection*/
process
	.on('SIGINT', () => gracefulShutdown('app termination', () => process.exit(0)))
	.on('SIGTERM', () => gracefulShutdown('Heroku app shutdown', () => process.exit(0)));

mongoose.connect(DB_URI);
module.exports = mongoose;
