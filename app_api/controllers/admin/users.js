'use strict';

var User = require('../../models/user')
  , Rol = require('../../models/rol')
  , UserRol = require('../../models/user-rol')
  , hh = require('../../helpers')
  , STATUS = require('../../helpers/status-codes')
  , code;

// TODO: check that every require params is present
module.exports.listUsers = function(req, res) {
  var projection = {
    fullName: 1,
    emails: 1
  };

  User.find({}, projection, function(err, users) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {users: users});
  });
};

module.exports.showUsers = function(req, res) {
  User.findOne({_id: req.params.userId}, function(err, user) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    if(!user) {
      code = STATUS.code(120);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {user: user.getPublicUser()});
  });
};

module.exports.addRol = function(req, res) {
  if(req.params.userId === req.user._id) {
    code = STATUS.code(111);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  var userRol;

  if(!req.body.scope) {
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
      .findById(req.params.userId)
      .exec(function(err, user) {
        if(err) {
          code = STATUS.code(501, err);
          return hh.sendJsonResponse(res, code.status, err);
        }
        if(!user) {
          code = STATUS.code(120);
          return hh.sendJsonResponse(res, code.status, {error: code});
        }

        userRol = new UserRol({
          id: req.params.rolId,
          scope: req.body.scope
        });

        user.admin = true;
        if(user.roles) {
          if(!userRol.rolExistInUser(user)) {
            user.roles.push(userRol);

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
          user.roles = [userRol];
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

module.exports.removeRol = function(req, res) {
  if(req.params.userId === req.user._id) {
    code = STATUS.code(111);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  User
    .findById(req.params.userId)
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
        if(user.roles[i].uuid === req.params.rolId) {
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
        code = STATUS.code(119);
        return hh.sendJsonResponse(res, code.status, {error: code});
      }

    });
};
