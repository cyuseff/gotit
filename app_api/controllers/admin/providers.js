'use strict';

var Provider = require('../../models/provider')
  , hh = require('../../helpers')
  , STATUS = require('../../helpers/status-codes')
  , code;

module.exports.listProviders = function(req, res) {
  Provider.find({}, function(err, providers) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {providers: providers});
  });
};

// TODO: check that every require params is present
module.exports.newProvider = function(req, res) {
  var prov = new Provider({
    name: req.body.name,
    slug: req.body.slug,
    description: req.body.description
  });

  prov.save(function(err) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 201, {message: 'Provider created', provider: prov});
  });
};

// TODO: check that every require params is present
module.exports.showProvider = function(req, res) {
  Provider.findOne({slug: req.params.providerId}, function(err, provider) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, provider);
  });
};