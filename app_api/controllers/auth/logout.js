"use strict";

var tokenCtrl = require('../token')
	, hh = require('../../../helpers');

module.exports.revokeToken = function(req, res){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token) {
		tokenCtrl.revokeUserToken(token, function(err, message) {
			if(err) return hh.sendJsonResponse(res, 500, err);
			return hh.sendJsonResponse(res, 200, message);
		});
  } else {
    return hh.sendJsonResponse(res, 400, {error: 'No token to revoke'});
  }
};

module.exports.revokeAllTokens = function(req, res){
	tokenCtrl.revokeAllUserTokens(req.user._id, function(err, message){
		if(err) return hh.sendJsonResponse(res, 500, err);
		//Token revoked
		return hh.sendJsonResponse(res, 200, message);
	});
};
