"use strict";

var router = require('express').Router()
  , localCtrl = require('../controllers/auth/local')
  , facebookCtrl = require('../controllers/auth/facebook')
  , logoutCtrl = require('../controllers/auth/logout')
  , hh = require('../../helpers');

router.route('/local').post(localCtrl.localStrategy);
router.route('/facebook').post(facebookCtrl.facebookStrategy);
router.route('/logout').get(logoutCtrl.revokeToken);
router.route('/logoutAll').get(hh.authToken, logoutCtrl.revokeAllTokens);

module.exports = function(app) {
  app.use('/api/v1/auth', router);
};
