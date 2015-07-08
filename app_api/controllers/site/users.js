'use strict';

var User = require('../../models/user')
  , hh = require('../../helpers');

module.exports.listUsers = function(req, res) {

  var ff = hh.addTextCriterias(req.query, ['full_name', 'order_by']);
  console.log(ff);
  console.log('ff*******');

  var criteria = {};
  if(ff.fullName) criteria.fullName = new RegExp(ff.fullName, 'i');
  console.log(criteria);
  console.log('criteria*******');

  var proyection = {
    emails: 1,
    fullName: 1
  };

  hh.paginateModel(req.query, User, criteria, function(err, meta) {
    if(err) return hh.sendJsonResponse(res, 500, err);

    console.log(meta);
    console.log('meta*******');

    User
      .find(criteria, proyection, { skip: meta.skip, limit: meta.per_page })
      .sort({createdAt: -1})
      .exec(function(err, users) {
        if(err) return hh.sendJsonResponse(res, 500, err);
        return hh.sendJsonResponse(res, 200, {users: users, meta: meta});
      });
  });

};

module.exports.showUser = function(req, res) {
  User
    .findById(req.params.userid)
    .exec(function(err, user) {
      if(err) return hh.sendJsonResponse(res, 500, err);
      if(!user) return hh.sendJsonResponse(res, 400, {error: 'No user found'});
      return hh.sendJsonResponse(res, 200, { user: user.getPublicUser() });
    });
};
