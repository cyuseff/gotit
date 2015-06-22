"use strict";

var User = require('../app_api/models/user')
  , redis = require('../config/redis')
  , jwt = require('jsonwebtoken')
  , SECRET = 'my-cool-secret';

function sendJsonResponse(res, status, content) {
  //console.log(content);
  res.status(status).json(content);
}
module.exports.sendJsonResponse = sendJsonResponse;

module.exports.authToken = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token) {
    jwt.verify(token, SECRET, function(err, decoded){
      if(err) {
        console.log(err);
        sendJsonResponse(res, 403, {error: 'Token is not valid.'});
      } else {

        //check if token exist
        redis.getUserToken(decoded.id, decoded.key, function(err, user){
          if(err) return sendJsonResponse(res, 403, err);

          //Token exist on redis
          if(user._id === decoded.id) {
            req.user = user;
            next();
          } else {
            return sendJsonResponse(res, 400, {error: 'Bad token.'});
          }

        });

      }
    });
  } else {
    sendJsonResponse(res, 403, {error: 'No token provided.'});
  }
};
