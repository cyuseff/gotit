'use strict';

const express = require('express');
const mongoose = require('./config/mongo');
const redis = require('./config/redis');
const bodyParser = require('body-parser');
const app = express();

// Config app

// Middlewares
app.use(express.static(__dirname + '/public', {index: false}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Routes
require('./app_api/routes/admin')(app);
require('./app_api/routes/site')(app);

module.exports = app;
