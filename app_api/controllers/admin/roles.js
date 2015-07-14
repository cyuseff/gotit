'use strict';

var Rol = require('../../models/rol')
  , User = require('../../models/user')
  , hh = require('../../helpers');

module.exports.newRol = function(req, res) {

  var routes = req.routes;

  var rol = new Rol({
    name: 'superadmin'
  });

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
  rol.name = vars.name || rol.name;
  rol.scope = vars.scope || rol.scope;
  rol.accessLevel = vars.accessLevel || rol.accessLevel;
  rol.routes = vars.routes || rol.routes;
  return rol;
}
module.exports.updateRol = function(req, res) {
  if(!req.params.rolId) return hh.sendJsonResponse(res, 400, {error: 'No id supplied.'});

  Rol.findOneById(req.params.rolId, function(err, rol) {
    if(err) return hh.sendJsonResponse(res, 500, err);
    if(!rol) return hh.sendJsonResponse(res, 404, {error: 'Rol not found'});

    rol = updateRol(rol, req.body);

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

module.exports.assignRol = function(req, res) {
  if(!req.body.userId) return hh.sendJsonResponse(res, 400, {error: 'User id is required.'});

  console.log(req.params.rolId, req.body.userId);

  User
    .findById(req.body.userId)
    .exec(function(err, user) {
      if(err) return hh.sendJsonResponse(res, 500, err);
      if(!user) return hh.sendJsonResponse(res, 400, {error: 'No user found'});

      user.admin = true;
      user.roles.push({
        id: req.params.rolId,
        scope: '3'
      });

      user.save(function(err) {
        if(err) return hh.sendJsonResponse(res, 500, err);
        return hh.sendJsonResponse(res, 200, {message: 'Rol assigned.', user: user});
      });
    });
};
