'use strict';

var express = require('express')
  , mongoose = require('./config/mongoose')
  , aero = require('./config/aero')
  , bodyParser = require('body-parser');

// Create app
var app = express();

// Config app
app.set('JWTSecret', 'my-cool-secret');

// CORS enabled
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, x-access-token');
  next();
});

// Middlewares
app.use(express.static(__dirname + '/public', {index: false}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Catch Options method
app.options('*', function(req, res) { return res.sendStatus(200); });
// Api Site routes
require('./app_api/routes/site')(app);
// Api Admin routes
require('./app_api/routes/admin')(app);
// Not found
app.use(function(req, res) { res.status(404).json({error: {
  code: 404,
  status: 404,
  msg: 'Not found'
}}); });

module.exports = app;
