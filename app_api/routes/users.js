'use strict';

var router = require('express').Router()
  , usersCtrl = require('../controllers/users')
  , hh = require('../../helpers');

/*function checkRole(role) {
  return function(req, res, next) {

    console.log('role: '+role);
    switch (role) {
      case 'owner':
        if(req.user._id === req.params.userid) {
          console.log('Is Owner!');
          next();
        } else {
          hh.sendJsonResponse(res, 403, {error: 'Roles don\'t match!'});
        }
        break;
    }
  };
}*/

router.route('/')
  .get(hh.authToken, usersCtrl.listUsers);

router.route('/:userid')
  .get(hh.authToken, usersCtrl.showUser);

module.exports = function(app) {
  app.use('/api/v1/users', router);
};
