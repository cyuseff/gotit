"use strict";

var express = require('express'),
  mongoose = require('./config/db'),
  passport = require('./config/pass'),
  bodyParser = require('body-parser');




//create app
var app = express();

//config app
app.use(bodyParser.urlencoded({extended:false}));
require('./config/session')(app);

//config passport
app.use(passport.initialize());
app.use(passport.session());


//Api Routes
require('./app_api/routes')(app);




/*TODO: refactor this in his own file*/

/** Index **/
app.get('/', function(req, res){
  res.send('OK');
});






/* Test for private route */
app.get('/private', ensureAuthenticated, function(req, res){
  res.sendStatus(200)
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.sendStatus(401);
}


//Not found
app.all('*', function(req, res){ res.status(404).send("404: Not found."); });


module.exports = app;
