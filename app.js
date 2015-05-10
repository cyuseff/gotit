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




/** LOGIN **/
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      console.log(info.message);
      return res.status(401).send(info.message);
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      res.status(200).send(user);
      return;
    });
  })(req, res, next);
});


app.get('/private', ensureAuthenticated, function(req, res){
  /*console.log("Cookies: ", req.cookies);
  console.log(req.session.passport.user);
  console.log(req.user);
  console.log(req.session.user);*/
  res.sendStatus(200);
});

app.get('/logout', function(req, res){
  req.logout();
  res.status(200).send('bye');
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.sendStatus(401);
}

/*function alreadyAuthenticated(req, res, next){
  if (req.user) {
    res.status(200).send(req.user);
  } else {
    next();
  }
}*/










app.get('*', function(req, res){ res.status(404).end(); });




module.exports = app;
