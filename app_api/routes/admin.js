'use strict';

var router = require('express').Router()
  , hh = require('../helpers')
  , rh = require('../helpers/roles')
  , userCtrl = require('../controllers/admin/users')
  , rolCtrl = require('../controllers/admin/roles');

// Users
router.route('/users')
  .all(hh.authToken, rh.isAllowed)
  .get(userCtrl.listUsers);
router.route('/users/:userId')
  .all(hh.authToken, rh.isAllowed)
  .get(userCtrl.showUsers);

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

router.route('/roles/:rolId/assign')
  .all(hh.authToken, rh.isAllowed)
  .post(rolCtrl.assignRol)
  .delete(rolCtrl.removeUserRol);


// Providers
var providers = [
  {id: '1', name: 'Provider001'},
  {id: '2', name: 'Provider002'},
  {id: '3', name: 'Provider003'}
];
function getProvider(id) {
  for(var i=0, l=providers.length; i<l; i++) if(id === providers[i].id) return providers[i];
  return null;
}
router.route('/providers')
  .all(hh.authToken, rh.isAllowed)
  .get(function(req, res) {
    hh.sendJsonResponse(res, 200, {providers: providers});
  });
router.route('/providers/:providerId')
  .all(hh.authToken, rh.isAllowed)
  .get(function(req, res) {
    var provider = getProvider(req.params.providerId);
    if(!provider) return hh.sendJsonResponse(res, 404, {error: 'Not Found.'});
    return hh.sendJsonResponse(res, 200, {provider: provider, user: req.user, rol: req.rol});
  });
router.route('/providers/:providerId/nested')
  .all(hh.authToken, rh.isAllowed)
  .get(function(req, res) {
    var provider = getProvider(req.params.providerId);
    if(!provider) return hh.sendJsonResponse(res, 404, {error: 'Not Found.'});
    return hh.sendJsonResponse(res, 200, {provider: provider, user: req.user, rol: req.rol});
  });


// Clubs
router.route('/clubs')
  .all(hh.authToken, rh.isAllowed)
  .get(function(req, res) {
    return hh.sendJsonResponse(res, 200, {message: 'Welcome to clubs', user: req.user, rol: req.rol});
  });


module.exports = function(app) {
  app.use('/api/v1/admin', router);
};
