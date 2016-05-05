'use strict';

const router = require('express').Router();
const bc = require('../controllers/base_controller');
const userCtrl = require('../controllers/admin/users');

// Authenticate token
router.use(bc.authToken);
// Admin privilege
// Authorize

// Users
router.route('/users')
  .get((req, res) => userCtrl.list(req, res));

module.exports = function(app) {
  app.use('/api/v1/admin', router);
}
