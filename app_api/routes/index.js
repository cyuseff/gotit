"use strict";

var jwt = require('jsonwebtoken')
  , SECRET = 'my-cool-secret';

var authToken = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token) {
    jwt.verify(token, SECRET, function(err, decoded){
      if(err) {
        console.log(err);
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        console.log(decoded);
        req.decoded = decoded;
        req.user = decoded;
        next();
      }
    });
  } else {
    return res.status(403).json({
      success:false,
      message: 'No token provided'
    });
  }
};


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

  app.get('/profile', authToken, function(req, res){
    res.render('profile.ejs', {user: req.user});
  });

};
