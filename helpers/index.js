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


function strToInt(str, defVal) {
  defVal = defVal || 0;
  if(!str) return defVal;
  var int = parseInt(str);
  return (!isNaN(int) && int >= defVal)? int : defVal;
}
module.exports.paginateModel = function(query, Model, filters, callback) {
  filters = filters || {};

  //console.log(query);
  var PER_PAGE = 15
    , PAGE = 1
    , per_page = strToInt(query.per_page, PER_PAGE)
    , page = strToInt(query.page, PAGE)
    , pages;

  Model.count(filters, function(err, count) {
    if(err) return callback(err);

    pages = Math.ceil(count / per_page);
    if(page > pages) page = pages;

    //callback(err, meta)
    return callback(null, {
      per_page: per_page,
      page: page,
      total_pages: pages,
      total_entries: count,
      skip: (page > 0)? (page - 1) * per_page : 0
    });
  });
};

function escapeRegExp(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
module.exports.addTextCriterias = function(query, filters) {
  var ff = {}
    , reg = /_[A-Z]/ig
    , val
    , key;

  for(var i=0, l=filters.length; i<l; i++) {
    val = query[filters[i]];
    if(!val) continue;

    key = filters[i].replace(reg, function(a){ return a[1].toUpperCase(); });
    ff[key] = escapeRegExp(val);
  }
  return ff;
};
