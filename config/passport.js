"use strict";

var passport = require('passport')
  , User = require('../app_api/models/user.js');


passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});


//Local
require('./passport/passport-local.js')(passport, User);

//Facebook
require('./passport/passport-facebook.js')(passport, User);

//Google
require('./passport/passport-google.js')(passport, User);

module.exports = passport;
