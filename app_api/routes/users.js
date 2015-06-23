"use strict";

var router = require('express').Router()
  , usersCtrl = require('../controllers/users')
  , hh = require('../../helpers');

router.route('/')
  .get(usersCtrl.listUsers);

module.exports = function(app) {
  app.use('/api/v1/users', router);
};
