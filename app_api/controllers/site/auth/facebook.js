'use strict';

var User = require('../../../models/user')
  , Token = require('../../../models/token')
  , request = require('request')
  , hh = require('../../../../helpers');


function facebookSignin(req, res, token) {

  // Get info from Facebook
  var options = {
    url: 'https://graph.facebook.com/v2.2/me?access_token='+token,
    method: 'GET'
  };

  request(options, function(err, facebookResponse, body) {

    var json = JSON.parse(body);

    // Create a new User
    var user = new User();

    // Push to users emails array
    user.emails.push(json.email);

    // add general properties
    user.firstName = json.first_name;
    user.lastName = json.last_name;
    user.fullName = json.name;

    // add strategy properties
    user.facebook.id = json.id;
    user.facebook.token = token;

    // save user before serialize into his token
    user.save(function(err) {
      if(err) return hh.sendJsonResponse(res, 500, err);

      // create session token
      Token.setUserToken(user, function(err, token) {

        // The user was created so send it back anyway even if token creation or Token fails
        if(err) console.log(err);

        // return the new user with token
        token = token || '001';
        return hh.sendJsonResponse(res, 201, { user: user.getPublicUser(), token: token });
      });
    });

  });
}

function facebookLogin(req, res, user, token) {
  // Check token
  if(user.facebook.token === token) {
    console.log('Token Match!');

    // create session token
    Token.setUserToken(user, function(err, token) {
      if(err) return hh.sendJsonResponse(res, 500, err);

      // return the new user with token
      return hh.sendJsonResponse(res, 200, { user: user.getPublicUser(), token: token });
    });

  } else {
    console.log('New Token!');

    // Update Facebook Token
    user.facebook.token = token;
    user.save(function(err) {
      if(err) return hh.sendJsonResponse(res, 500, err);

      // create session token
      Token.setUserToken(user, function(err, token) {

        // Its necesary send back a valid token
        if(err) return hh.sendJsonResponse(res, 500, err);

        // return the user with the new token
        return hh.sendJsonResponse(res, 200, { user: user.getPublicUser(), token: token });
      });
    });

  }
}


var _ID = '909396282439703'
  , _SECRET = 'd7062dfb81a1574860aff74f1a7cfcad';

module.exports.facebookStrategy = function(req, res) {
  var userId = req.body.id
    , token = req.body.token;

  if(!userId || !token) return hh.sendJsonResponse(res, 400, {error: 'Missing credentials'});

  // Check if FbToken is valid for GotIt app
  var fbOpts = {
    url: 'https://graph.facebook.com/debug_token?input_token='+token+'&access_token=' + _ID + '|' + _SECRET,
    method: 'GET'
  };
  request(fbOpts, function(err, facebookResponse, body) {
    var json = JSON.parse(body);

    // Check if info is correct
    if(!json.data || !json.data.is_valid || !json.data.app_id === _ID || !json.data.user_id === userId) {
      return hh.sendJsonResponse(res, 403, {error: 'Facebook token error'});
    }

    User
      .findOne({ 'facebook.id': userId })
      .exec(function(err, user) {

        if(err) return hh.sendJsonResponse(res, 500, err);

        if(user) {
          // Old user, start login flow
          facebookLogin(req, res, user, token);
        } else {
          // New user, start signin flow
          facebookSignin(req, res, token);
        }

      });

  });

};
