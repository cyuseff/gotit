'use strict';

var User = require('../../models/user')
  , hh = require('../../helpers')
  , STATUS = require('../../helpers/status-codes')
  , code;

module.exports.listUsers = function(req, res) {
  User.find({}, function(err, users) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {users: users});
  });
};

module.exports.showUsers = function(req, res) {
  User.findOne({_id: req.params.userId}, function(err, user) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {user: user.getPublicUser()});
  });
};
