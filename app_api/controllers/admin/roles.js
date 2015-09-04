'use strict';

var Rol = require('../../models/rol')
  , User = require('../../models/user')
  , hh = require('../../helpers');

/* TODO: this is not well implemented */
module.exports.newRol = function(req, res) {
  if(!req.body.name) return hh.sendJsonResponse(res, 400, {error: 'Rol name is required.'});

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

/*
  This method can be improved using for in + hasOwnProperty
*/
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

function rolExistInUser(rol, roles) {
  for(var i=0, l=roles.length; i<l; i++) if(roles[i].id === rol.id && roles[i].scope === rol.scope) return true;
  return false;
}
module.exports.assignRol = function(req, res) {
  var rol;
  if(!req.body.userId || !req.body.scope) return hh.sendJsonResponse(res, 400, {error: 'User id and Scope are both required.'});

  Rol.findOneById(req.params.rolId, function(err, rol) {
    if(err) return hh.sendJsonResponse(res, 500, err);
    if(!rol) return hh.sendJsonResponse(res, 404, {error: 'Rol not found'});

    User
      .findById(req.body.userId)
      .exec(function(err, user) {
        if(err) return hh.sendJsonResponse(res, 500, err);
        if(!user) return hh.sendJsonResponse(res, 400, {error: 'No user found'});

        rol = {id: req.params.rolId, scope: req.body.scope};
        user.admin = true;
        if(user.roles) {
          if(!rolExistInUser(rol, user.roles)) {
            user.roles.push(rol);

            user.saveAndUpdate(function(err) {
              if(err) return hh.sendJsonResponse(res, 500, err);
              return hh.sendJsonResponse(res, 200, {message: 'Rol assigned.', user: user});
            });
          } else {
            return hh.sendJsonResponse(res, 400, {message: 'User already have this rol.', user: user});
          }
        } else {
          user.saveAndUpdate = [rol];
          user.save(function(err) {
            if(err) return hh.sendJsonResponse(res, 500, err);
            return hh.sendJsonResponse(res, 200, {message: 'Rol assigned.', user: user});
          });
        }
      });
  });
};
