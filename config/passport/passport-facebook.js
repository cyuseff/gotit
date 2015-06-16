"use strict";

var FacebookStrategy = require('passport-facebook').Strategy
  , auth = require('./auth.js')
  , redis = require('../redis');

module.exports = function(passport, User){

  passport.use(new FacebookStrategy(
    //config
    {
      clientID: auth.facebookAuth.clientID,
      clientSecret: auth.facebookAuth.clientSecret,
      callbackURL: auth.facebookAuth.callbackURL,
      passReqToCallback: true
    },
    function(req, token, refreshToken, profile, done){
      process.nextTick(function(){

        var emails = [];
        for(var i=0, l=profile.emails.length; i<l; i++) emails.push(profile.emails[i].value);

        User
          .findOne({ 'facebook.id': profile.id })
  				//.findOne({ emails:{ $in: emails } })
  				.exec(function(err, user) {

            if(err) return done(err);

            if(user) {
              //Login User
              redis.setUserToken(user, function(err, token){

                if(err) return done(err);

                //return the new user with token
                return done(null, user, {token:token});
              });
            } else {

              //Create a new User
    					var user = new User();

              //user's primary email, add to account emails list
  						user.email = profile.emails[0].value;
              user.emails = emails;

              //add general properties
  						user.firstName = profile.name.givenName;
  						user.lastName = profile.name.familyName;
  						user.fullName = profile.name.givenName + ' ' + profile.name.familyName;

              //add strategy properties
              user.facebook.id = profile.id;
              user.facebook.token = token;
              user.facebook.email = profile.emails[0].value;
              user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;

              //save user before serialize into his token
  						user.save(function(err){
  							if(err) return done(err);

                //create session token
                redis.setUserToken(user, function(err, token){

                  //The user was created so send it back anyway even if token creation or redis fails
                  if(err) console.log(err);

                  //return the new user with token
                  return done(null, user, {token:token||'001'});
                });

  						});

            }

          });

      });
    }
  ));

};
