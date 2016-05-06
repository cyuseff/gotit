'use strict';

const router = require('express').Router();
const localCtrl = require('../controllers/site/auth/local');
const logoutCtrl = require('../controllers/site/auth/logout');

// Auth routes
router.route('/auth/local').post((req, res) => localCtrl.localStrategy(req, res));
router.route('/auth/logout').get((req, res) => logoutCtrl.logout(req, res));
router.route('/auth/logout-all').get((req, res) => logoutCtrl.logoutAll(req, res));

module.exports = function(app) {
  app.use('/api/v1', router);
};
