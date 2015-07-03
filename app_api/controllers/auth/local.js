"use strict";

var User = require('../../models/user')
  , tokenCtrl = require('../token')
  , validator = require('validator')
	, hh = require('../../../helpers');


function localSignin(req, res, email, password, confirm_password) {

  //Check password and confirmation
  if(password !== confirm_password) return hh.sendJsonResponse(res, 400, {error: 'Passwords don\'t match'});

  User
    .findOne({'local.email': email })
    //.findOne({ emails:{ $in: [email] } })
    .exec(function(err, user) {

      if(err) return hh.sendJsonResponse(res, 500, err);
      if(user) return hh.sendJsonResponse(res, 409, { error: 'User already exits.' });

      //Create a new User
      var user = new User();
      user.generateHash(password, function(err, hash) {

        if(err) return hh.sendJsonResponse(res, 500, err);

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
          if(err) return hh.sendJsonResponse(res, 500, err);

          //create session token
          tokenCtrl.setUserToken(user, function(err, token){

            //The user was created so send it back anyway even if token creation or redis fails
            if(err) console.log(err);

            //return the new user with token
            token = token || '001';
            return hh.sendJsonResponse(res, 201, { user: user.getPublicUser(), token: token });
          });

        });

      });

    });

}


function localLogin(req, res, email, password) {

  User.findOne({'local.email':email}, function(err, user){

    if(err) return hh.sendJsonResponse(res, 500, err);
    if(!user) return hh.sendJsonResponse(res, 403, {error:'User not found.'});

    //Check password
    user.comparePassword(password, function(err, isMatch) {
      if(err) return hh.sendJsonResponse(res, 500, err);
      if(isMatch) {

        //create session token
        tokenCtrl.setUserToken(user, function(err, token){
          if(err) return hh.sendJsonResponse(res, 500, err);

          //return the new user with token
          return hh.sendJsonResponse(res, 200, { user: user.getPublicUser(), token: token });
        });

      } else {
        return hh.sendJsonResponse(res, 403, {error:'Oops! Wrong password...'});
      }
    });


  });

}

module.exports.localStrategy = function(req, res) {
  var email = req.body.email
    , password = req.body.password
    , confirm_password = req.body.confirm_password;

    if(!email || !password) return hh.sendJsonResponse(res, 400, {error: 'Missing credentials'});

    //Check email
    if(!validator.isEmail(email, {allow_utf8_local_part:false})) return hh.sendJsonResponse(res, 400, {error: 'Invalid email address'});

    //Check password
    if(!validator.isAlphanumeric(password)) return hh.sendJsonResponse(res, 400, {error: 'Password can only have alpha numerical characters'});

    //Check password length
    if(password.length < 6) return hh.sendJsonResponse(res, 400, {error: 'Password must have at least 6 characthers length'});


    if(!confirm_password) {
      //Old user, start login flow
      localLogin(req, res, email, password);
    } else {
      //New user, start signin flow
      localSignin(req, res, email, password, confirm_password);
    }

};
