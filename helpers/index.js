"use strict";

var User = require('../app_api/models/user')
  , tokenCtrl = require('../app_api/controllers/token')
  , validator = require('validator');

function sendJsonResponse(res, status, content) {
  //console.log(content);
  res.status(status).json(content);
}
module.exports.sendJsonResponse = sendJsonResponse;

module.exports.authToken = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if(token) {
    tokenCtrl.validateToken(token, function(err, user) {
      if(err) {
        if(err.error) {
          return sendJsonResponse(res, 403, err);
        } else {
          return sendJsonResponse(res, 500, err);
        }
      }
      //user exist
      req.user = user;
      next();
    });
  } else {
    sendJsonResponse(res, 403, {error: 'No token provided.'});
  }
};


function strToInt(query, defVal) {
  if(!query) return defVal;
  var int = parseInt(query);
  return (!isNaN(int) && int >= 1)? int : defVal;
}
module.exports.paginateModel = function(query, Model, filters, callback) {

  filters = filters || {};

  console.log(query);
  var PER_PAGE = 15
    , PAGE = 1
    , per_page = strToInt(query.per_page, PER_PAGE)
    , page = strToInt(query.page, PAGE);

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

    return callback(null, meta, skip);
  });
};

module.exports.getValidFiltersFromRequest = function(query, filters) {
  var ff = {}
    , reg = /^[0-9A-Z_-]+$/i
    , reg2 = /_[A-Z]/ig
    , filter
    , key;

  for(var i=0, l=filters.length; i<l; i++) {
    filter = query[filters[i]];
    if(!filter) continue;

    if(reg.test(filter)) {
      key = filters[i].replace(reg2, function(a){ return a[1].toUpperCase(); });
      ff[key] = filter;
    }
  }
  return ff;
};
