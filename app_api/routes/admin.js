'use strict';

var router = require('express').Router()
  , hh = require('../helpers')
  , rolCtrl = require('../controllers/admin/roles');

/* This block should have his own file */
var Rol = require('../models/rol');

function isAdmin(req, res, next) {
  if(req.user && req.user.admin) return next();
  return hh.sendJsonResponse(res, 403, {message: 'You don\'t have admin privilege!'});
}
function checkRoute(route, scope, reqUrl, reqMethod, prefixUrl) {

  var url
    , regEx
    , match;

  // remove final "/"
  reqUrl = reqUrl.replace(/\/$/, '');

  console.log(route);
  console.log('scope: '+scope);
  console.log('reqUrl: '+reqUrl);
  console.log('reqMethod: '+reqMethod);
  console.log('prefixUrl: '+prefixUrl);

  if(scope === '*') scope = '\\w*';
  if(route.recursive) scope += '(\/\\w+)*';

  url = (prefixUrl + route.url.replace(':scope', scope)).replace(/\//g, '\\/');
  regEx = new RegExp('^' + url + '$');
  console.log(url);
  console.log(regEx);
  console.log(regEx.exec(reqUrl));

  // test if route match the scoped route
  match = regEx.exec(reqUrl);
  if(match) {
    // check wildcard on methods
    if(route.methods === '*') {
      return {url: match[0], method: route.methods, accessLevel: route.accessLevel};
    } else {
      if(route.methods.indexOf(reqMethod) !== -1) {
        return {url: match[0], method: reqMethod, accessLevel: route.accessLevel};
      } else {
        return false;
      }
    }
  }
}
function isAllowed(req, res, next) {

  var reqUrl = req.originalUrl.split('?')[0]
    , prefixUrl = '/api/v1/admin/'
    , url;

  isAdmin(req, res, function() {
    if(!req.user.roles) return hh.sendJsonResponse(res, 403, {error: 'No roles.'});

    Rol.findOneById(req.user.roles[0].id, function(err, rol) {
      for(var i=0, l=rol.routes.length; i<l; i++) {
        var isAllowed = checkRoute(rol.routes[i], req.user.roles[0].scope, reqUrl, req.method, prefixUrl);
        if(isAllowed) {
          req.rol = isAllowed;
          req.rol.name = rol.name;
          req.rol.accessLevel = req.rol.accessLevel || rol.accessLevel;
          return next();
        }
      }
      return hh.sendJsonResponse(res, 403, {message: 'You don\'t have admin privilege!'});
    });
  });
}
/* end */

// Roles
router.route('/roles')
  .all(hh.authToken, isAllowed)
  .get(rolCtrl.listRoles)
  .post(rolCtrl.newRol);

router.route('/roles/:rolId')
  .all(hh.authToken, isAllowed)
  .get(rolCtrl.showRol)
  .put(rolCtrl.updateRol)
  .delete(rolCtrl.removeRol);


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
  .all(hh.authToken, isAllowed)
  .get(function(req, res) {
    hh.sendJsonResponse(res, 200, {providers: providers});
  });
router.route('/providers/:providerId')
  .all(hh.authToken, isAllowed)
  .get(function(req, res) {
    var provider = getProvider(req.params.providerId);
    if(!provider) return hh.sendJsonResponse(res, 404, {error: 'Not Found.'});
    return hh.sendJsonResponse(res, 200, {provider: provider, user: req.user, rol: req.rol});
  });
router.route('/providers/:providerId/nested')
  .all(hh.authToken, isAllowed)
  .get(function(req, res) {
    var provider = getProvider(req.params.providerId);
    if(!provider) return hh.sendJsonResponse(res, 404, {error: 'Not Found.'});
    return hh.sendJsonResponse(res, 200, {provider: provider, user: req.user, rol: req.rol});
  });


// Clubs
router.route('/clubs')
  .all(hh.authToken, isAllowed)
  .get(function(req, res) {
    return hh.sendJsonResponse(res, 200, {message: 'Welcome to clubs', user: req.user, rol: req.rol});
  });


module.exports = function(app) {
  app.use('/api/v1/admin', router);
};
