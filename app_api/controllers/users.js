"use strict";

var User = require('../models/user')
  , hh = require('../../helpers');

module.exports.listUsers = function(req, res) {

  var ff = hh.getValidFiltersFromRequest(req.query, ['fullName', 'createdAt']);
  console.log(ff);

  var filters = {};
  if(ff.fullName) filters.fullName = new RegExp(ff.fullName, 'i');

  var proyection = {
    emails: 1,
    fullName: 1
  };

  hh.paginateModel(req.query, User, filters, function(err, meta, skip) {
    if(err) return hh.sendJsonResponse(res, 500, err);
    User
      .find(filters, proyection, { skip:skip, limit:meta.per_page })
      .sort({createdAt: -1})
      .exec(function(err, users) {
        if(err) return hh.sendJsonResponse(res, 500, err);
        return hh.sendJsonResponse(res, 200, {users: users, meta:meta});
      });
  });

};

module.exports.showUser = function(req, res) {
  User
    .findById(req.params['userid'])
    .exec(function(err, user) {
      if(err) return hh.sendJsonResponse(res, 500, err);
      if(!user) return hh.sendJsonResponse(res, 400, {error:'No user found'});
      return hh.sendJsonResponse(res, 200, { user: user.getPublicUser() });
    });
};
