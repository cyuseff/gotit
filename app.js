'use strict';

const express = require('express');
const mongoose = require('./config/mongo');
const redis = require('./config/redis');
const bodyParser = require('body-parser');
const app = express();

// Config app
global.__base = __dirname;

// Middlewares
app.use(express.static(__dirname + '/public', {index: false}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Routes
// Api Site routes
require('./app_api/routes/site')(app);

module.exports = app;
