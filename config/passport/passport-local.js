"use strict";

var LocalStrategy = require('passport-local').Strategy;

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

        if(email && password) {
      		if(password === req.body.confirm_password) {

      			User
      				.findOne({'local.email': req.body.email })
      				//.findOne({ emails:{ $in: [email] } })
      				.exec(function(err, user) {

                if(err) return done(null, false, err);

      					if(user) {
      						if(user.local.email === req.body.email) {
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
                    if(err) return done(null, false, err);

      							//create a session token
      							user.generateToken(function(token){

      								//save user token
      								user.save(function(err){
                        if(err) return done(null, false, err);

      									//return the new user
                        return done(null, user);

      								});

      							});

      						});

      					});

      				});

      		} else {
            return done(null, false, { message:'Passwords don\'t match.', status: 400 });
      		}

      	}

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
      User.findOne({'local.email':email}, function(err, user){
        if(err) return done(err);

        //No user
        if(!user) return done(null, false, { message:'No user found.', status: 403 });

        //Check password
        user.comparePassword(password, function(err, isMatch) {
          if (err) return done(err);
          if(isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message:'Oops! Wrong password..', status: 403 });
          }
        });


      });
    }
  ));

};
