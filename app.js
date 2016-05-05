'use strict';

const express = require('express');
const mongoose = require('./config/mongo');
const redis = require('./config/redis');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

// Config app

// Middlewares
if(process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.static(path.resolve(__dirname, 'public'), {index: false}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Routes
require('./app_api/routes/admin')(app);
require('./app_api/routes/site')(app);
app.use((req, res) => res.status(404).send('Not found.'));

module.exports = app;
