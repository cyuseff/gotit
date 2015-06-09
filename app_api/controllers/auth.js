"use strict";

var User = require('../models/user')
	, passport = require('../../config/passport');

function sendJsonResponse (res, status, content) {
	console.log(content);
	res.status(status).json(content);
}

module.exports.localSignup = function(req, res, next){
	passport.authenticate('local-signup', function(err, user, info){
		if(user) return sendJsonResponse(res, 200, { user: user.getPublicUser(), token:user.token });

		if(info) {
			//merge
			if(info.user) {
				return sendJsonResponse(res, info.status,
					{
						message: 'Your email has been associated with other account.',
						account: info.user.getPublicUser(),
						account_merge_url: '/auth/merge/'
					});
			} else {
				//send error
				return sendJsonResponse(res, info.status, {message:info.message});
			}
		}

	})(req, res, next);
};

module.exports.localLogin = function(req, res, next){
	passport.authenticate('local-login', function(err, user, info) {

		if(err) return sendJsonResponse(res, 400, {message:err});
		if(!user) return sendJsonResponse(res, info.status, {message:info.message});

		return sendJsonResponse(res, 200, { user: user.getPublicUser(), token:user.token });

	})(req, res, next);
};


module.exports.facebookStrategy = function(req, res, next){
	passport.authenticate('facebook', function(err, user, info){
		if(user) return sendJsonResponse(res, 200, { user: user.getPublicUser(), token:user.token });
		if(info) return sendJsonResponse(res, 401,
			{
				error: 'Your email has been associated with other account.',
				account: info.user.getPublicUser(),
				account_merge_url: '/auth/merge/'
			});
	})(req, res, next);
};


module.exports.googleStrategy = function(req, res, next){
	passport.authenticate('google', function(err, user, info){
		if(user) return sendJsonResponse(res, 200, { user: user.getPublicUser(), token:user.token });
		if(info) return sendJsonResponse(res, 401,
			{
				error: 'Your email has been associated with other account.',
				account: info.user.getPublicUser(),
				account_merge_url: '/auth/merge/'
			});
	})(req, res, next);
};

/*
module.exports.localStrategy = function(req, res) {
  if(req.body.email && req.body.password) {
		if(req.body.password === req.body.confirm_password) {

			User
				//.findOne({'local.email': req.body.email })
				.findOne({ emails:{ $in: [req.body.email] } })
				.exec(function(err, user) {

					if(err) return sendJsonResponse(res, 400, {error: err});

					if(user) {
						if(user.local.email === req.body.email) {
							//Email is used on local strategy
							return sendJsonResponse(res, 400, {error: 'User already exits.'});
						} else {
							//Merge account strategy!
							return sendJsonResponse(res, 400, {error: 'This email has been used to create another account, do you want to merge?'});
						}
					}

					//Create a new User
					var user = new User();
					user.generateHash(req.body.password, function(err, hash) {

						if(err) return sendJsonResponse(res, 400, {error: err});

						//user's primary email, add to account emails list
						user.email = req.body.email;
						user.emails.push(req.body.email);

						//add general properties
						user.firstName = req.body.first_name;
						user.lastName = req.body.last_name;
						user.fullName = req.body.first_name + ' ' + req.body.last_name;

						//add strategy properties
						user.local.email = req.body.email;
						user.local.password = hash;

						//save user before serialize into his token
						user.save(function(err){
							if(err) return sendJsonResponse(res, 400, {error: err});

							//create a session token
							user.generateToken(function(token){

								//save user token
								user.save(function(err){
									if(err) return sendJsonResponse(res, 400, err);

									//return the new user
									sendJsonResponse(res, 200, { user: user.getPublicUser(), token:user.token });

								});

							});

						});

					});

				});

		} else {
			sendJsonResponse(res, 400, {error:'Passwords don\'t match.'});
		}

	} else {
		sendJsonResponse(res, 400, {error:'Email and password are required.'});
	}

};
*/
