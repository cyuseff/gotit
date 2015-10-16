'use strict';

var Rol = require('../../models/rol')
  , User = require('../../models/user')
  , hh = require('../../helpers')
  , STATUS = require('../../helpers/status-codes')
  , code;

module.exports.newRol = function(req, res) {
  if(!req.body.name || !req.body.accessLevel || !req.body.routes.length) {
    code = STATUS.code(114);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  var rol = new Rol({
    name: req.body.name,
    accessLevel: req.body.accessLevel
  });

  req.body.routes.map(function(route) {
    rol.addRoute(route.url, route.methods, route.recursive, route.accessLevel);
  });

  rol.save(function(err, reply) {
    if(err) {
      code = STATUS.code(500, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 201, {message: 'Rol created', rol: rol});
  });
};

module.exports.listRoles = function(req, res) {
  Rol.findAll(function(err, roles) {
    if(err) {
      code = STATUS.code(500, err);
      return hh.sendJsonResponse(res, code.status, err);
    }
    return hh.sendJsonResponse(res, 200, {roles: roles});
  });
};

module.exports.showRol = function(req, res) {
  if(!req.params.rolId) {
    code = STATUS.code(111);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  Rol.findOneById(req.params.rolId, function(err, rol) {
    if(err) {
      code = STATUS.code(500, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    if(!rol) {
      code = STATUS.code(110);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, rol);
  });

};

function updateRol(rol, vars) {
  rol.name = vars.name;
  rol.accessLevel = vars.accessLevel;
  rol.routes = vars.routes;
  return rol;
}
module.exports.updateRol = function(req, res) {
  if(!req.params.rolId) {
    code = STATUS.code(111);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  if(!req.body.name || !req.body.accessLevel || !req.body.routes.length) {
    code = STATUS.code(114);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  Rol.findOneById(req.params.rolId, function(err, rol) {
    if(err) {
      code = STATUS.code(500, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    if(!rol) {
      code = STATUS.code(110);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }

    rol = updateRol(rol, req.body);

    rol.save(function(err, reply) {
      if(err) {
        code = STATUS.code(500, err);
        return hh.sendJsonResponse(res, code.status, {error: code});
      }
      return hh.sendJsonResponse(res, 200, {message: 'Rol updated', rol: rol});
    });

  });
};

module.exports.removeRol = function(req, res) {

  if(!req.params.rolId) {
    code = STATUS.code(110);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  Rol.remove(req.params.rolId, function(err, reply) {
    if(err) {
      code = STATUS.code(500, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {message: 'Rol deleted'});
  });
};
