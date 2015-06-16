"use strict";

var LocalStrategy = require('passport-local').Strategy
  , validator = require('validator')
  , redis = require('../redis');

module.exports = function(passport, User){

  //Signup Local Strategy
  passport.use('local-signup', new LocalStrategy(
    //config
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, email, password, done) {

      process.nextTick(function(){

        //Check email
        if(!validator.isEmail(email, {allow_utf8_local_part:false})) return done(null, false, {message: 'Invalid email address', status: 400});

        //Check password
        if(!validator.isAlphanumeric(password)) return done(null, false, {message: 'Password can only have alpha numerical characters', status: 400});

        //Check password length
        if(password.length < 6) return done(null, false, {message: 'Password must have at least 6 characthers length', status: 400});

        //Check password and confirmation
    		if(password !== req.body.confirm_password) return done(null, false, { message:'Passwords don\'t match.', status: 400 });

  			User
  				.findOne({'local.email': email })
  				//.findOne({ emails:{ $in: [email] } })
  				.exec(function(err, user) {

            if(err) return done(null, false, err);

  					if(user) {
  						if(user.local.email === email) {
  							//Email is used on local strategy
                return done(null, false, { message: 'User already exits.', status: 409 });
  						} else {
                //Old account user, merge path
                var info = {
                  message: 'Email is asociated in other account',
                  status: 409,
                  user: user
                };
                return done(null, false, info);
  						}
  					}

  					//Create a new User
  					var user = new User();
  					user.generateHash(password, function(err, hash) {

              if(err) return done(null, false, err);

  						//user's primary email, add to account emails list
  						user.email = email;
  						user.emails.push(email);

  						//add general properties
  						user.firstName = req.body.first_name;
  						user.lastName = req.body.last_name;
  						user.fullName = req.body.first_name + ' ' + req.body.last_name;

  						//add strategy properties
  						user.local.email = email;
  						user.local.password = hash;

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

  					});

  				});



      });
    }

  ));

  //Login Local Strategy
  passport.use('local-login', new LocalStrategy(
    //config
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, email, password, done) {

      process.nextTick(function(){

        //Check email
        if(!validator.isEmail(email, {allow_utf8_local_part:false})) return done(null, false, {message: 'Invalid email address', status: 400});

        //Check password
        if(!validator.isAlphanumeric(password)) return done(null, false, {message: 'Password can only have alpha numerical characters', status: 400});

        User.findOne({'local.email':email}, function(err, user){
          if(err) return done(err);

          //No user
          if(!user) return done(null, false, { message:'User not found.', status: 403 });

          //Check password
          user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if(isMatch) {

              //create session token
              redis.setUserToken(user, function(err, token){
                if(err) return done(null, false, err);

                //return the new user with token
                return done(null, user, {token:token});
              });

            } else {
              return done(null, false, { message:'Oops! Wrong password..', status: 403 });
            }
          });


        });

      });
    }
  ));

};
