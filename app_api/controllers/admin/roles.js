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

function rolExistInUser(rol, roles) {
  for(var i=0, l=roles.length; i<l; i++) if(roles[i].id === rol.id && roles[i].scope === rol.scope) return true;
  return false;
}
module.exports.assignRol = function(req, res) {
  var rol;
  if(!req.body.userId || !req.body.scope) {
    code = STATUS.code(112);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  Rol.findOneById(req.params.rolId, function(err, rol) {
    if(err) {
      code = STATUS.code(500, err);
      return hh.sendJsonResponse(res, code.status, err);
    }
    if(!rol) {
      code = STATUS.code(110);
      return hh.sendJsonResponse(res, code.status, err);
    }

    User
      .findById(req.body.userId)
      .exec(function(err, user) {
        if(err) {
          code = STATUS.code(501, err);
          return hh.sendJsonResponse(res, code.status, err);
        }
        if(!user) {
          code = STATUS.code(120);
          return hh.sendJsonResponse(res, code.status, {error: code});
        }

        rol = {id: req.params.rolId, scope: req.body.scope};
        user.admin = true;
        if(user.roles) {
          if(!rolExistInUser(rol, user.roles)) {
            user.roles.push(rol);

            user.saveAndUpdate(function(err) {
              if(err) {
                code = STATUS.code(501, err);
                return hh.sendJsonResponse(res, code.status, {error: code});
              }
              return hh.sendJsonResponse(res, 200, {message: 'Rol assigned', user: user.getPublicUser()});
            });
          } else {
            code = STATUS.code(113);
            return hh.sendJsonResponse(res, code.status, {error: code});
          }
        } else {
          user.roles = [rol];
          user.saveAndUpdate(function(err) {
            if(err) {
              code = STATUS.code(501, err);
              return hh.sendJsonResponse(res, code.status, {error: code});
            }
            return hh.sendJsonResponse(res, 200, {message: 'Rol assigned', user: user.getPublicUser()});
          });
        }
      });
  });
};

module.exports.removeUserRol = function(req, res) {
  if(!req.body.userId) {
    code = STATUS.code(121);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  User
    .findById(req.body.userId)
    .exec(function(err, user) {
      if(err) {
        code = STATUS.code(501, err);
        return hh.sendJsonResponse(res, code.status, err);
      }
      if(!user) {
        code = STATUS.code(120);
        return hh.sendJsonResponse(res, code.status, {error: code});
      }

      //
      var idx = null;
      for(var i=0, l=user.roles.length; i<l; i++) {
        if(user.roles[i].id === req.params.rolId) {
          idx = i;
          break;
        }
      }

      if(idx !== null) {
        user.roles.splice(idx, 1);
        user.admin = (user.roles.length > 0);
        user.saveAndUpdate(function(err) {
          if(err) {
            code = STATUS.code(501, err);
            return hh.sendJsonResponse(res, code.status, err);
          }
          return hh.sendJsonResponse(res, 200, {message: 'Rol removed', user: user.getPublicUser()});
        });
      } else {
        return hh.sendJsonResponse(res, 400, {error: 'No rol on user'});
      }

    });
};
