'use strict';

var Token = require('../../../models/token')
	, hh = require('../../../helpers')
	, jwt = require('jsonwebtoken')
	, env = require('../../../../config/env')
	, PREFIX = 'user'
	, SECRET = env.JWT_SECRET
	, SET_PREFIX = env.SET_PREFIX;

module.exports.revokeUserToken = function(req, res) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if(token) {
		Token.removeByJwt(token, function(err, message) {
			if(err) return hh.sendJsonResponse(res, 500, err);
			return hh.sendJsonResponse(res, 200, message);
		});
	} else {
		return hh.sendJsonResponse(res, 400, {error: 'No token to revoke'});
	}
};

module.exports.revokeAllUserTokens = function(req, res) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
	jwt.verify(token, SECRET, function(err, decoded) {
		if(err) return hh.sendJsonResponse(res, 400, {error: 'Token is not valid.'});
		Token.removeAllInSet(PREFIX, decoded.id, function(err, reply) {
			if(err) return hh.sendJsonResponse(res, 500, err);
			return hh.sendJsonResponse(res, 200, {count: reply, message: 'All user tokens revoked.'});
		});
	});
};
