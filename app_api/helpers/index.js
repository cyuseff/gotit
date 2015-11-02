'use strict';

var User = require('../models/user')
  , Token = require('../models/token')
  , validator = require('validator')
  , STATUS = require('./status-codes');

function sendJsonResponse(res, status, content) {
  content.meta = {
    status: status
  };
  res.status(status).json(content);
}
module.exports.sendJsonResponse = sendJsonResponse;

module.exports.authToken = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token']
    , code;

  if(token) {
    Token.findByJwt(token, function(err, reply) {
      if(err) return sendJsonResponse(res, err.status, {error: err});
      // User exist, attach it to req
      req.user = reply.data;
      // Attach the rest of the info to the req
      req.jwt = reply;
      next();
    },
    true,
    function(token, decoded) {
      return token.data._id === decoded.sid;
    });
  } else {
    code = STATUS.code(101);
    sendJsonResponse(res, code.status, {error: code});
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

  // console.log(query);
  var PER_PAGE = 15
    , PAGE = 1
    , perPage = strToInt(query.per_page, PER_PAGE)
    , page = strToInt(query.page, PAGE)
    , pages;

  Model.count(filters, function(err, count) {
    if(err) return callback(err);

    pages = Math.ceil(count / perPage);
    if(page > pages) page = pages;

    // callback(err, meta)
    return callback(null, {
      per_page: perPage,
      page: page,
      total_pages: pages,
      total_entries: count,
      skip: (page > 0)? (page - 1) * perPage : 0
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

    key = filters[i].replace(reg, function(a) { return a[1].toUpperCase(); });
    ff[key] = escapeRegExp(val);
  }
  return ff;
};
