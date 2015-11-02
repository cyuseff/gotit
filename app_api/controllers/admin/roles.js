'use strict';

var Rol = require('../../models/rol')
  , User = require('../../models/user')
  , hh = require('../../helpers')
  , STATUS = require('../../helpers/status-codes')
  , code;

module.exports.create = function(req, res) {
  var name = req.body.name.trim()
    , accessLevel = parseInt(req.body.accessLevel.trim());

  if(!name || !accessLevel || !req.body.routes.length) {
    code = STATUS.code(114);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  var rol = new Rol({
    name: name,
    accessLevel: accessLevel
  });

  for(var i=0, l=req.body.routes.length; i<l; i++) {
    rol.addRoute(
      req.body.routes[i].url,
      req.body.routes[i].methods,
      parseInt(req.body.routes[i].recursive),
      parseInt(req.body.routes[i].accessLevel)
    );
  }

  rol.save(function(err, reply) {
    if(err) {
      code = STATUS.code(500, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 201, {message: 'Rol created', rol: rol});
  });
};

module.exports.list = function(req, res) {
  Rol.findAll(function(err, roles) {
    if(err) {
      code = STATUS.code(500, err);
      return hh.sendJsonResponse(res, code.status, err);
    }
    roles = roles.map(function(rol) {
      return {
        id: rol.id,
        name: rol.name
      };
    });
    return hh.sendJsonResponse(res, 200, {roles: roles});
  });
};

module.exports.show = function(req, res) {
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
  if(vars.name) rol.name = vars.name;
  if(vars.accessLevel) rol.accessLevel = vars.accessLevel;
  if(vars.routes && vars.routes.length) {
    rol.routes = [];
    for(var i=0, l=vars.routes.length; i<l; i++) {
      rol.addRoute(
        vars.routes[i].url,
        vars.routes[i].methods,
        parseInt(vars.routes[i].recursive),
        parseInt(vars.routes[i].accessLevel)
      );
    }
  }
  return rol;
}
module.exports.update = function(req, res) {
  var name = req.body.name.trim()
    , accessLevel = parseInt(req.body.accessLevel.trim());

  if(!name || !accessLevel || !req.body.routes.length) {
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

module.exports.remove = function(req, res) {
  Rol.remove(req.params.rolId, function(err, reply) {
    if(err) {
      code = STATUS.code(500, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {message: 'Rol deleted'});
  });
};
