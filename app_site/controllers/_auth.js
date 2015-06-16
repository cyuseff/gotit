"use strict";

var User = require('../models/user')
	, passport = require('../../config/passport')
	, hh = require('../../helpers/helpers');

module.exports.localSignup = function(req, res, next){
	passport.authenticate('local-signup', function(err, user, info){

		if(err) return hh.sendJsonResponse(res, 400, {message:err});

		if(user && info.token) return hh.sendJsonResponse(res, 200, { user: user.getPublicUser(), token:info.token });

		if(info) {
			//merge
			if(info.user) {
				return hh.sendJsonResponse(res, info.status,
					{
						message: 'This email has been associated with other account.',
						account: info.user.getPublicUser(),
						account_merge_url: '/auth/merge/'
					});
			} else {
				//send error
				var status = info.status || 400;
				return hh.sendJsonResponse(res, status, {message:info.message});
			}
		}

	})(req, res, next);
};

module.exports.localLogin = function(req, res, next){
	passport.authenticate('local-login', function(err, user, info) {

		if(err) return hh.sendJsonResponse(res, 400, {message:err});
		if(!user) return hh.sendJsonResponse(res, (info.status || 400), {message:info.message});

		return hh.sendJsonResponse(res, 200, { user: user.getPublicUser(), token:info.token });

	})(req, res, next);
};


module.exports.facebookStrategy = function(req, res, next){
	passport.authenticate('facebook', function(err, user, info){

		if(err) return hh.sendJsonResponse(res, 400, {message:err});

		if(user && info.token) return hh.sendJsonResponse(res, 200, { user: user.getPublicUser(), token:info.token });

	})(req, res, next);
};


module.exports.googleStrategy = function(req, res, next){
	passport.authenticate('google', function(err, user, info){
		if(user) return hh.sendJsonResponse(res, 200, { user: user.getPublicUser(), token:user.token });
		if(info) return hh.sendJsonResponse(res, 401,
			{
				error: 'Your email has been associated with other account.',
				account: info.user.getPublicUser(),
				account_merge_url: '/auth/merge/'
			});
	})(req, res, next);
};
