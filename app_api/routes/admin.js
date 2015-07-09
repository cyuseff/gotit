'use strict';

var router = require('express').Router()
  , hh = require('../helpers')
  , rolCtrl = require('../controllers/admin/roles');

function isAdmin(req, res, next) {
  if(req.user && req.user.admin) return next();
  return hh.sendJsonResponse(res, 403, {message: 'You don\'t have admin privilege!'});
}

// Roles
router.route('/roles')
  .get(rolCtrl.listRoles)
  .post(rolCtrl.newRol);

router.route('/roles/:rolId')
  .get(rolCtrl.showRol)
  .put(rolCtrl.updateRol)
  .delete(rolCtrl.removeRol);


module.exports = function(app) {
  app.use('/api/v1/admin', hh.authToken, isAdmin, router);
};
