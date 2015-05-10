"use strict";

var passport = require('../../config/pass'),
  hh = require('../helpers/helpers'),
  User = require('../models/user.js');

module.exports.signinUser = function(req, res) {

	User.create({
		name: req.body.name,
	  email: req.body.email,
	  password: req.body.password,
	}, function(err, user) {
		if (err) {
			hh.sendJsonResponse(res, 400, err);
		} else {
			hh.sendJsonResponse(res, 201, hh.formatUser(user));
		}
	});

};

module.exports.loginUser = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      console.log(info.message);
      return res.status(401).send(info.message);
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      res.status(200).send(user);
      return;
    });
  })(req, res, next);
};

module.exports.logoutUser = function(req, res) {
  req.logout();
  res.status(200).send('bye');
};
