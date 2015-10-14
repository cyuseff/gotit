'use strict';

var Token = require('../../../models/token')
	, hh = require('../../../helpers')
	, STATUS = require('../../../helpers/status-codes')
	, code;

module.exports.revokeUserToken = function(req, res) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if(token) {
		Token.removeByJwt(token, function(err, reply) {
			if(err) return hh.sendJsonResponse(res, err.status, {error: err});
			return hh.sendJsonResponse(res, 200, {message: 'Signed Out'});
		});
	} else {
		code = STATUS.code(101);
		return hh.sendJsonResponse(res, code.status, {error: code});
	}
};

module.exports.revokeAllUserTokens = function(req, res) {
	Token.removeAllInSetbySid(req.jwt.set, req.jwt.sid, function(err, reply) {
		if(err) {
			code = STATUS.code(500);
			return hh.sendJsonResponse(res, 500, err);
		}
		return hh.sendJsonResponse(res, 200, {count: reply, message: 'All user tokens revoked'});
	});
};
