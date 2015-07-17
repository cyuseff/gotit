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
        return null;
      }
    }
  } else {
    return null;
  }
}

function checkRoutesInRoles(roles, userRoles, reqUrl, reqMethod, prefixUrl) {
  var allowedRoutes = [];

  // iterate roles
  for(var i=0, l=roles.length; i<l; i++) {
    console.log(roles[i]);
    console.log(userRoles[i]);
    console.log('*****-----*****');

    // iterate routes
    for(var j=0, d=roles[i].routes.length; j<d; j++) {
      var route = checkRoute(roles[i].routes[j], userRoles[i].scope, reqUrl, reqMethod, prefixUrl);
      if(route) {
        route.rolId = roles[i].id;
        route.rolName = roles[i].name;
        route.scope = userRoles[i].scope;
        route.accessLevel = route.accessLevel || roles[i].accessLevel;
        allowedRoutes.push(route);
      }
    }
  }
  return allowedRoutes;
}

function winningRoute(routes) {
  if(routes.length === 1) {
    return routes[0];
  } else {
    // TODO: check accessLevel, url and scope to rank compute a winner
    return routes;
  }
}

module.exports.isAllowed = function(req, res, next) {

  var prefixUrl = '/api/v1/admin/'
    , ids = []
    , allowedRoutes;

  // check if user is admin
  if(!req.user || !req.user.admin) return hh.sendJsonResponse(res, 403, {message: 'You don\'t have admin privilege!'});
  // check if user has roles
  if(!req.user.roles) return hh.sendJsonResponse(res, 403, {message: 'You don\'t have roles.'});
  // get roles ids
  for(var i=0, l=req.user.roles.length; i<l; i++) ids.push(req.user.roles[i].id);

  Rol.findByIds(ids, function(err, roles) {
    if(err) return hh.sendJsonResponse(res, 500, err);
    if(!roles.length) return hh.sendJsonResponse(res, 403, {message: 'Rol not found. You don\'t have the required privilege!.'});

    allowedRoutes = checkRoutesInRoles(roles, req.user.roles, req.originalUrl.split('?')[0], req.method, prefixUrl);
    console.log(allowedRoutes);

    if(allowedRoutes.length) {
      req.rol = winningRoute(allowedRoutes);
      return next();
    } else {
      return hh.sendJsonResponse(res, 403, {message: 'You don\'t have the required privilege!.'});
    }

  });
};
