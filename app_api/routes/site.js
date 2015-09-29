'use strict';

var router = require('express').Router()
  , localCtrl = require('../controllers/site/auth/local')
  , facebookCtrl = require('../controllers/site/auth/facebook')
  , logoutCtrl = require('../controllers/site/auth/logout')
  , usersCtrl = require('../controllers/site/users')
  , hh = require('../helpers');

// Auth routes
router.route('/auth/local').post(localCtrl.localStrategy);
router.route('/auth/facebook').post(facebookCtrl.facebookStrategy);
router.route('/auth/logout').get(logoutCtrl.revokeUserToken);
router.route('/auth/logoutAll').get(hh.authToken, logoutCtrl.revokeAllUserTokens);


// Users routes
router.route('/me').get(hh.authToken, function(req, res) {
  hh.sendJsonResponse(res, 200, {user: req.user});
});

router.route('/users').get(hh.authToken, usersCtrl.listUsers);
router.route('/users/:userid').get(hh.authToken, usersCtrl.showUser);

module.exports = function(app) {
  app.use('/api/v1', router);

  // Private test Route
  app.get('/private', hh.authToken, function(req, res) {
    hh.sendJsonResponse(res, 200, {message: 'This content is private!', user: {
      id: req.user._id,
      name: req.user.fullName
    }});
  });
};
