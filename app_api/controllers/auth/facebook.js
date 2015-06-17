"use strict";

var User = require('../../models/user')
  , redis = require('../../../config/redis')
  , validator = require('validator')
  , request = require('request')
  , hh = require('../../../helpers');


module.exports.facebookSignin = function(req, res) {
  var userId = req.body.id
    , token = req.body.token
    , emails = [];

  //for(var i=0, l=profile.emails.length; i<l; i++) emails.push(profile.emails[i].value);

  console.log(userId, token);

  if(!userId || !token) return hh.sendJsonResponse(res, 400, {error: 'Missing credentials'});

  User
    .findOne({ 'facebook.id': userId })
    //.findOne({ emails:{ $in: emails } })
    .exec(function(err, user) {

      if(err) return hh.sendJsonResponse(res, 400, err);
      if(user) return hh.sendJsonResponse(res, 409, { error: 'User already exits' });

      //Check facebook token
      var options = {
    		url: 'https://graph.facebook.com/v2.2/me?access_token='+token,
    		method: 'GET'
    	};

      request(options, function(err, facebookResponse, body){
        var json = JSON.parse(body);

        if(json.id != userId) return hh.sendJsonResponse(res, 403, {error:'Credentials error'});

        //Create a new User
        var user = new User();

        //Push to users emails array
        user.emails.push(json.email);

        //add general properties
        user.firstName = json.first_name;
        user.lastName = json.last_name;
        user.fullName = json.name;

        //add strategy properties
        user.facebook.id = json.id;
        user.facebook.token = token;

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

module.exports.facebookLogin = function(req, res) {
  var userId = req.body.id
    , token = req.body.token
    , emails = [];

  //for(var i=0, l=profile.emails.length; i<l; i++) emails.push(profile.emails[i].value);

  if(!userId || !token) return hh.sendJsonResponse(res, 400, {error: 'Missing credentials'});

  User
    .findOne({ 'facebook.id': userId })
    //.findOne({ emails:{ $in: emails } })
    .exec(function(err, user) {

      if(err) return hh.sendJsonResponse(res, 400, err);
      if(!user) return hh.sendJsonResponse(res, 404, {error:'User not found.'});

      //Check token
      if(user.facebook.token === token) {

        console.log('Token Match!');

        //create session token
        redis.setUserToken(user, function(err, token){
          if(err) return hh.sendJsonResponse(res, 400, err);

          //return the new user with token
          return hh.sendJsonResponse(res, 200, { user: user.getPublicUser(), token: token });
        });

      } else {
        console.log('Check with facebook');
        //Check if facebook token is valid
        //https://graph.facebook.com/debug_token?input_token=CAAM7F1JfZBBcBAFHMsEZAmjbkFIvJkl7ZC7up9lhUUcTHbcHKdZAc56mISERhyh2hDRVLjPlaATaToXcQgH6CYdqSRksydkypJ990LSKAcNZBMAfHrUbQBGZCPFdbLzwUBGvpW89iuhzrVgLUpQTqAKKKlDNtcnMs0uiE9aCNUgdkO4SmZABcAcehg0wx16pqTSDkpVplUJD43L2rv6gzPs&access_token=909396282439703|d7062dfb81a1574860aff74f1a7cfcad
        //TODO: use this url to know if the token is valid for the app.
        var options = {
      		url: 'https://graph.facebook.com/me?access_token='+token,
      		method: 'GET'
      	};

        request(options, function(err, facebookResponse, body){
          var json = JSON.parse(body);
          console.log(json.id, userId);
          if(json.id != userId) return hh.sendJsonResponse(res, 403, {error:'Credentials error'});

          //Update Facebook Token
          user.facebook.token = token;
          user.save(function(err){
            if(err) return hh.sendJsonResponse(res, 400, err);

            //create session token
            redis.setUserToken(user, function(err, token){

              //Its necesary send back a valid token
              if(err || !token) return hh.sendJsonResponse(res, 400, {error:'Opps something goes wrong. Try again.'});

              //return the user with the new token
              return hh.sendJsonResponse(res, 200, { user: user.getPublicUser(), token: token });
            });
          });

      	});


      }

    });

};
