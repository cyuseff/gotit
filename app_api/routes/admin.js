'use strict';

const router = require('express').Router();
const userCtrl = require('../controllers/admin/users.js');

// Users
router.route('/users')
  .all((req, res, next) => userCtrl.authToken(req, res, next))
  .get((req, res) => userCtrl.list(req, res));

module.exports = function(app) {
  app.use('/api/v1/admin', router);
}
