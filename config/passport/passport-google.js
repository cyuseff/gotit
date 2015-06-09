"use strict";

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , auth = require('./auth.js');

module.exports = function(passport, User){

  passport.use(new GoogleStrategy(
    //config
    {
      clientID: auth.googleAuth.clientID,
      clientSecret: auth.googleAuth.clientSecret,
      callbackURL: auth.googleAuth.callbackURL
    },
    function(token, refreshToken, profile, done) {

      process.nextTick(function(){

        var emails = [];
        for(var i=0, l=profile.emails.length; i<l; i++) emails.push(profile.emails[i].value);

        User
  				.findOne({ 'google.id': profile.id })
          //.findOne({ emails:{ $in: emails } })
  				.exec(function(err, user) {

            if(err) return done(err);

            if(user) {
              if(user.google.id === profile.id) {
                //Email is used on facebook strategy, send token
                return done(null, user);
              } else {
                //Old account user, merge path
                var info = {
                  error: 'Email is asociated in other account',
                  user: user,
                  profile: profile
                };
                return done(null, false, info);
              }

            } else {

              //Create a new User
    					var user = new User();

              //user's primary email, add to account emails list
  						user.email = profile.emails[0].value;
              user.emails = emails;

              //add general properties
  						user.firstName = profile.name.givenName;
  						user.lastName = profile.name.familyName;
  						user.fullName = profile.displayName;

              //add strategy properties
              user.google.id = profile.id;
              user.google.token = token;
              user.google.email = profile.emails[0].value;
              user.google.name = profile.displayName;

              //save user before serialize into his token
  						user.save(function(err){
  							if(err) return done(err);

  							//create a session token
  							user.generateToken(function(token){

  								//save user token
  								user.save(function(err){
                    if(err) return done(err);

  									//return the new user
                    return done(null, user);

  								});

  							});

  						});

            }

          });


      });
    }
  ));

};
