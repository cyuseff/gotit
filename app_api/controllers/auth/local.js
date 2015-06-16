"use strict";

var User = require('../../models/user')
  , redis = require('../../../config/redis')
  , validator = require('validator')
	, hh = require('../../../helpers');


module.exports.localSignin = function(req, res){

  var email = req.body.email
    , password = req.body.password;

  console.log(email);
  console.log('---------------');

  if(!email || !password) return hh.sendJsonResponse(res, 400, {error: 'Missing credentials'});

  //Check email
  if(!validator.isEmail(email, {allow_utf8_local_part:false})) return hh.sendJsonResponse(res, 400, {error: 'Invalid email address'});

  //Check password
  if(!validator.isAlphanumeric(password)) return hh.sendJsonResponse(res, 400, {error: 'Password can only have alpha numerical characters'});

  //Check password length
  if(password.length < 6) return hh.sendJsonResponse(res, 400, {error: 'Password must have at least 6 characthers length'});

  //Check password and confirmation
  if(password !== req.body.confirm_password) return hh.sendJsonResponse(res, 400, {error: 'Passwords don\'t match'});


  User
    .findOne({'local.email': email })
    //.findOne({ emails:{ $in: [email] } })
    .exec(function(err, user) {

      if(err) return hh.sendJsonResponse(res, 400, err);
      if(user) return hh.sendJsonResponse(res, 409, { error: 'User already exits.' });

      //Create a new User
      var user = new User();
      user.generateHash(password, function(err, hash) {

        if(err) return hh.sendJsonResponse(res, 400, err);

        //Push to users emails array
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
          if(err) return hh.sendJsonResponse(res, 400, err);

          //create session token
          redis.setUserToken(user, function(err, token){

            //The user was created so send it back anyway even if token creation or redis fails
            if(err) console.log(err);

            //return the new user with token
            token = token || '001';
            return hh.sendJsonResponse(res, 201, { user: user.getPublicUser(), token: token });
          });

        });

      });

    });

};


module.exports.localLogin = function(req, res){

  var email = req.body.email
    , password = req.body.password;

  if(!email || !password) return hh.sendJsonResponse(res, 400, {error: 'Missing credentials'});

  //Check email
  if(!validator.isEmail(email, {allow_utf8_local_part:false})) return hh.sendJsonResponse(res, 400, {error: 'Invalid email address'});

  //Check password
  if(!validator.isAlphanumeric(password)) return hh.sendJsonResponse(res, 400, {error: 'Password can only have alpha numerical characters'});

  User.findOne({'local.email':email}, function(err, user){

    if(err) return hh.sendJsonResponse(res, 400, err);
    if(!user) return hh.sendJsonResponse(res, 403, {error:'User not found.'});

    //Check password
    user.comparePassword(password, function(err, isMatch) {
      if (err) return done(err);
      if(isMatch) {

        //create session token
        redis.setUserToken(user, function(err, token){
          if(err) return hh.sendJsonResponse(res, 400, err);

          //return the new user with token
          return hh.sendJsonResponse(res, 200, { user: user.getPublicUser(), token: token });
        });

      } else {
        return hh.sendJsonResponse(res, 403, {error:'Oops! Wrong password...'});
      }
    });


  });

};
