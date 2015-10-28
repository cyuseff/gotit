'use strict';

var router = require('express').Router()
  , hh = require('../helpers')
  , rh = require('../helpers/roles')
  , userCtrl = require('../controllers/admin/users')
  , rolCtrl = require('../controllers/admin/roles')
  , providerCtrl = require('../controllers/admin/providers');

// Users
router.route('/users')
  .all(hh.authToken, rh.isAllowed)
  .get(userCtrl.listUsers);
router.route('/users/:userId')
  .all(hh.authToken, rh.isAllowed)
  .get(userCtrl.showUsers);
router.route('/users/:userId/roles/:rolId')
  .all(hh.authToken, rh.isAllowed)
  .post(userCtrl.addRol)
  .delete(userCtrl.removeRol);

// Roles
router.route('/roles')
  .all(hh.authToken, rh.isAllowed)
  .get(rolCtrl.listRoles)
  .post(rolCtrl.newRol);

router.route('/roles/:rolId')
  .all(hh.authToken, rh.isAllowed)
  .get(rolCtrl.showRol)
  .put(rolCtrl.updateRol)
  .delete(rolCtrl.removeRol);


// Providers
router.route('/providers')
  .all(hh.authToken, rh.isAllowed)
  .get(providerCtrl.listProviders)
  .post(providerCtrl.newProvider);

router.route('/providers/:providerId')
  .all(hh.authToken, rh.isAllowed)
  .get(providerCtrl.showProvider)
  .put(providerCtrl.updateProvider)
  .delete(providerCtrl.removeProvider);


module.exports = function(app) {
  app.use('/api/v1/admin', router);
};


// Write Admin routes in a file
var fs = require('fs')
  , routes = []
  , fsName = 'admin-routes.json';

for(var i=0, l=router.stack.length; i<l; i++) {
  routes.push({
    path: router.stack[i].route.path,
    methods: router.stack[i].route.methods
  });
}

fs.writeFile('public/' + fsName, JSON.stringify({routes: routes}), 'utf8', function(err) {
  if(err) return console.log(err);
  console.log(fsName + ' writed!');
});
