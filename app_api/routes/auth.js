"use strict";

var router = require('express').Router()
  , ctrl = require('../controllers/auth')
  , passport = require('passport');


//*** local-strategy  ***//
router.route('/local')
  .post(ctrl.localSignup);

router.route('/local-login')
  .post(ctrl.localLogin);

//*** facebook-strategy  ***//
router.route('/facebook')
  .get(passport.authenticate('facebook', { scope: 'email', session: false }));

router.route('/facebook/callback')
  .get(ctrl.facebookStrategy);

//*** google-strategy  ***//
router.route('/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.route('/google/callback')
  .get(ctrl.googleStrategy);






module.exports = function(app) {
  app.use('/auth', router);
};
