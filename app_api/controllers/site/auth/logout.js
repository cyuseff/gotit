'use strict';

var Token = require('../../../models/token')
	, hh = require('../../../helpers');

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
	Token.removeAllInSet(req.jwt.prefix, req.jwt.id, function(err, reply) {
		if(err) return hh.sendJsonResponse(res, 500, err);
		return hh.sendJsonResponse(res, 200, {count: reply, message: 'All user tokens revoked.'});
	});
};
