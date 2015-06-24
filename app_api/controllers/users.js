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
    if(err) return hh.sendJsonResponse(res, 400, {error:err});

    User
      .find(filters, proyection, { skip:skip, limit:meta.per_page })
      .sort( { createdAt: -1 } )
      .exec(function(err, users) {
        if(err) return hh.sendJsonResponse(res, 400, err);
        return hh.sendJsonResponse(res, 200, {users: users, meta:meta});
      });
  });


};
