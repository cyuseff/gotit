"use strict";

var hh = require('../../helpers');

module.exports = function(app) {

  app.get('/fb', function(req, res){
    res.render('fb.ejs');
  });

  //home
  /*app.get('/', function(req, res){
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

  app.get('/logout', hh.revokeToken, function(req, res){
    res.redirect('/');
  });*/

};
