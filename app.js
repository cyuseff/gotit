"use strict";

var express = require('express')
  , mongoose = require('./config/database')
  , morgan = require('morgan')
  , bodyParser = require('body-parser')
  , passport = require('./config/passport');

//create app
var app = express();

//config app
app.set('view engine', 'ejs');

//middlewares
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

app.use(passport.initialize());
app.use(passport.session());

//Api routes
require('./app_api/routes')(app);

//Not found
app.use(function(req, res){ res.status(404).send("404: Not found."); });

module.exports = app;
