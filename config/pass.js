var mongoose = require('mongoose'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('../app_api/models/user');


function formatUser(user) {
	return {_id:user._id, name:user.name, email:user.email};
}


passport.serializeUser(function(user, done) {


  done(null, formatUser(user));
  //Passport default
  //done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


passport.use(new LocalStrategy({
    usernameField: 'email'
  },function(username, password, done) {
  User.findOne({ email: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid password' });
      }
    });
  });
}));


module.exports = passport;
