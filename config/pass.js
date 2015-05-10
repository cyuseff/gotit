var mongoose = require('mongoose'),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  User = require('../app_api/models/user');


passport.serializeUser(function(user, done) {
  //use UUID instead user._id
  done(null, user.uuid);
});

passport.deserializeUser(function(uuid, done) {

  //use uuid instead _id
  User.findOne(uuid, function (err, user) {
    done(err, user);
  });


  //Passport default
  /*User.findById(id, function (err, user) {
    done(err, user);
  });*/
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
