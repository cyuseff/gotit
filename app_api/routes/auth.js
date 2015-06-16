"use strict";

var router = require('express').Router()
  , localCtrl = require('../controllers/auth/local')
  , facebookCtrl = require('../controllers/auth/facebook')
  , passport = require('passport');


router.route('/local').post(localCtrl.localSignin);
router.route('/local/login').post(localCtrl.localLogin);

router.route('/facebook').post(facebookCtrl.facebookSignin);
router.route('/facebook/login').post(facebookCtrl.facebookLogin);


module.exports = function(app) {
  app.use('/api/v1/auth', router);
};
