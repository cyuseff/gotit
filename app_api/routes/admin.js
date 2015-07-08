'use strict';

var router = require('express').Router()
  , hh = require('../helpers');

// Test route
router.route('/').get(function(req, res) {
  hh.sendJsonResponse(res, 200, {message: 'OK'});
});


module.exports = function(app) {
  app.use('/api/v1/admin', hh.authToken, router);
};
