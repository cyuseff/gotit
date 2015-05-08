"use strict";

var express = require('express'),
  session = require('express-session');

var app = express();

//Database connection
var db = require('./config/db.js');

//Api Routes
require('./app_api/routes')(app);






/** Index **/
app.get('/', function(req, res){
  res.send('OK');
});




/** LOGIN **/
app.post('/login', function(req, res){
  res.sendStatus(200);
});













app.get('*', function(req, res){ res.status(404).end(); });




module.exports = app;
