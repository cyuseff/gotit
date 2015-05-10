"use strict";

var router = require('express').Router(),
	controller = require('../controllers/session');

//*** /signin  ***//
router.route('/signin')
	.post(controller.signinUser);


//*** /login  ***//
router.route('/login')
	.post(controller.loginUser);


//*** /logout  ***//
router.route('/logout')
  .get(controller.logoutUser)
	.post(controller.logoutUser);

module.exports = function(app){
  app.use('/', router);
};
