"use strict";

var router = require('express').Router()
  , usersCtrl = require('../controllers/users')
  , hh = require('../../helpers');

router.route('/')
  .get(hh.authToken, usersCtrl.listUsers);

router.route('/:userid')
  .get(hh.authToken, usersCtrl.showUser);

module.exports = function(app) {
  app.use('/api/v1/users', router);
};
