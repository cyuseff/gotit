"use strict";

var User = require('../app_api/models/user')
  , redis = require('../config/redis')
  , jwt = require('jsonwebtoken')
  , validator = require('validator')
  , SECRET = 'my-cool-secret';

function sendJsonResponse(res, status, content) {
  console.log(content);
  res.status(status).json(content);
}
module.exports.sendJsonResponse = sendJsonResponse;

module.exports.authToken = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if(token) {
    jwt.verify(token, SECRET, function(err, decoded){
      if(err) {
        console.log(err);
        sendJsonResponse(res, 403, {error: 'Token is not valid.'});
      } else {

        //check if token exist
        redis.getUserToken(decoded.id, decoded.key, function(err, user){
          if(err) return sendJsonResponse(res, 403, err);

          //Token exist on redis
          if(user._id === decoded.id) {
            req.user = user;
            next();
          } else {
            return sendJsonResponse(res, 400, {error: 'Bad token.'});
          }

        });

      }
    });
  } else {
    sendJsonResponse(res, 403, {error: 'No token provided.'});
  }
};


function queryToInt(query, defVal) {
  if(!query) return defVal;
  var int = parseInt(query);
  return (!isNaN(int) && int >= 1)? int : defVal;
}
module.exports.paginateModel = function(query, Model, filters, callback) {

  filters = filters || {};

  console.log(query);
  var PER_PAGE = 15
    , PAGE = 1
    , per_page = queryToInt(query.per_page, PER_PAGE)
    , page = queryToInt(query.page, PAGE);

  Model.count(filters, function(err, count) {
    if(err) return callback(err);

    var pages = Math.ceil(count / per_page);
    if(page > pages) page = pages;

    var meta = {
      per_page: per_page,
      page: page,
      total_pages: pages,
      total_entries: count
    };

    var skip = (page - 1) * per_page;

    callback(null, meta, skip);
  });
};

module.exports.getValidFiltersFromRequest = function(query, filters) {
  var ff = {};
  for(var i=0, l=filters.length; i<l; i++) {
    var filter = query[filters[i]];
    if(!filter) continue;
    if(validator.isAlphanumeric(filter)) ff[filters[i]] = filter;
  }
  return ff;
};
