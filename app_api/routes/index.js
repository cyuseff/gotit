"use strict";

var hh = require('../helpers/helpers');


module.exports = function(app) {
  require('./auth')(app);
  //require('./users')(app);

  //home
  app.get('/', function(req, res){
    res.render('index.ejs');
  });

  //
  app.get('/signup', function(req, res){
    res.render('signup.ejs');
  });
  app.get('/login', function(req, res){
    res.render('login.ejs');
  });

  app.get('/profile', hh.authToken, function(req, res){
    res.render('profile.ejs', {user: req.user});
  });

};
