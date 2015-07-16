'use strict';

var Rol = require('../models/rol')
  , hh = require('./index');

function checkRoute(route, scope, reqUrl, reqMethod, prefixUrl) {
  var url = route.url
    , regEx;

  // remove final "/"
  reqUrl = reqUrl.replace(/\/$/, '');

  // check wildcard on :scope
  if(scope === '*') scope = '[\\w-]*';
  url = prefixUrl + url.replace(':scope', scope);

  // add pattern if is flagged as recursive
  if(route.recursive) url += '([\/\\w-]+)*';

  // escape url to create the regExp
  url.replace(/\//g, '\\/');

  // create the regExp matching the beginning and the end
  regEx = new RegExp('^' + url + '$');

  if(regEx.test(reqUrl)) {
    // check wildcard on methods
    if(route.methods === '*') {
      return {url: route.url, method: reqMethod, accessLevel: route.accessLevel};
    } else {
      if(route.methods.indexOf(reqMethod) !== -1) {
        return {url: route.url, method: reqMethod, accessLevel: route.accessLevel};
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
}

module.exports.isAllowed = function(req, res, next) {

  var reqUrl = req.originalUrl.split('?')[0]
    , prefixUrl = '/api/v1/admin/';

  // check if user is admin
  if(!req.user || !req.user.admin) return hh.sendJsonResponse(res, 403, {message: 'You don\'t have admin privilege!'});
  // check if user has roles
  if(!req.user.roles) return hh.sendJsonResponse(res, 403, {error: 'You don\'t have roles.'});

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
    return hh.sendJsonResponse(res, 403, {message: 'You don\'t have the required privilege!'});
  });
};
