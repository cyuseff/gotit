'use strict';

var express = require('express')
  , mongoose = require('./config/mongoose')
  , redis = require('./config/redis')
  , morgan = require('morgan')
  , bodyParser = require('body-parser');

// Create app
var app = express();

// Config app
app.set('JWTSecret', 'my-cool-secret');
app.set('view engine', 'ejs');
require('./config/admin');

// Middlewares
// app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/*
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});
*/

// Api Site routes
require('./app_api/routes/site')(app);

// Api Admin routes
require('./app_api/routes/admin')(app);

// Site routes
require('./app_site/routes')(app);

// Not found
app.use(function(req, res) {
  res.status(404).json({error: 'Not found.'});
});

module.exports = app;
