'use strict';

const router = require('express').Router();
const localCtrl = require(`${__base}/app_api/controllers/site/auth/local`);

// Auth routes
router.route('/auth/local').post((req, res) => localCtrl.localStrategy(req, res));

module.exports = function(app) {
  app.use('/api/v1', router);
}
