"use strict";

var User = require('../models/user')
  , jwt = require('jsonwebtoken')
  , SECRET = 'my-cool-secret';

function sendJsonResponse(res, status, content) {
  console.log(content);
  res.status(status).json(content);
}
module.exports.sendJsonResponse = sendJsonResponse;

module.exports.authToken = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token) {
    jwt.verify(token, SECRET, function(err, decoded){
      if(err) {
        //console.log(err);
        sendJsonResponse(res, 403, {message: 'Failed to authenticate token.'});
      } else {
        //console.log(decoded);

        User.findById(decoded._id, function(err, user) {

          if(err) return sendJsonResponse(res, 400, {message: 'Opps, something goes wrong.'});
          if(!user) return sendJsonResponse(res, 400, {message: 'Bad token.'});

          if(user.token === token) {
            req.user = decoded;
            next();
          } else {
            sendJsonResponse(res, 403, {message: 'Token no longer valid.'});
          }

        });
      }
    });
  } else {
    sendJsonResponse(res, 403, {message: 'No token provided.'});
  }
};
