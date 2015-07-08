'use strict';

var router = require('express').Router()
  , hh = require('../helpers');



module.exports = function(app) {
  app.use('/api/v1/admin', hh.authToken, router);
};
