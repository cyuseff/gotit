'use strict';

var Rol = require('../../models/rol')
  , hh = require('../../helpers');

module.exports.newRol = function(req, res) {

  var routes = req.routes;

  var rol = new Rol(null, 'superAdmin', 1);
  rol.addRoute('*', '*', true);
  rol.save(function(err, reply) {
    if(err) return hh.sendJsonResponse(res, 500, err);
    return hh.sendJsonResponse(res, 201, rol);
  });
};

module.exports.listRoles = function(req, res) {
  Rol.findAll(function(err, roles) {
    if(err) return hh.sendJsonResponse(res, 500, err);
    return hh.sendJsonResponse(res, 200, {roles: roles});
  });
};

module.exports.showRol = function(req, res) {
  if(!req.params.rolId) return hh.sendJsonResponse(res, 400, {error: 'No id supplied.'});

  Rol.findOneById(req.params.rolId, function(err, rol) {
    if(err) return hh.sendJsonResponse(res, 500, err);
    if(!rol) return hh.sendJsonResponse(res, 404, {error: 'Rol not found'});
    return hh.sendJsonResponse(res, 200, rol);
  });

};

function updateRol(rol, vars) {
  if(vars.routes === 'routes') {
    var routes = JSON.parse(vars.routes)
      , tmp = [];

    for(var i=0, l=routes.length; i<l; i++) tmp.push(routes[i]);
    rol.routes = tmp;
  }

  if(vars.access_level) rol.accessLevel = vars.access_level;
  if(vars.name) rol.name = vars.name;
}
module.exports.updateRol = function(req, res) {
  if(!req.params.rolId) return hh.sendJsonResponse(res, 400, {error: 'No id supplied.'});

  Rol.findOneById(req.params.rolId, function(err, rol) {
    if(err) return hh.sendJsonResponse(res, 500, err);
    if(!rol) return hh.sendJsonResponse(res, 404, {error: 'Rol not found'});

    updateRol(rol, req.body);

    rol.save(function(err, reply) {
      if(err) return hh.sendJsonResponse(res, 500, err);
      return hh.sendJsonResponse(res, 200, rol);
    });

  });
};

module.exports.removeRol = function(req, res) {

  if(!req.params.rolId) return hh.sendJsonResponse(res, 400, {error: 'No id supplied.'});

  Rol.remove(req.params.rolId, function(err, message) {
    if(err) return hh.sendJsonResponse(res, 500, err);
    return hh.sendJsonResponse(res, 200, message);
  });
};
