'use strict';

var Provider = require('../../models/provider')
  , hh = require('../../helpers')
  , STATUS = require('../../helpers/status-codes')
  , code;

module.exports.listProviders = function(req, res) {

  var projection = {
    name: 1,
    slug: 1,
    _id: 0
  };

  Provider.find({}, projection, function(err, providers) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {providers: providers});
  });
};

// TODO: check that every require params is present
// TODO: handle duplicated slug
module.exports.newProvider = function(req, res) {
  var prov = new Provider({
    name: req.body.name,
    slug: req.body.slug,
    description: req.body.description
  });

  prov.save(function(err) {
    if(err) {
      code = (err.code === 11000)? STATUS.code(141, err) : STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 201, {message: 'Provider created', provider: prov});
  });
};

module.exports.showProvider = function(req, res) {
  Provider.findOne({slug: req.params.providerId}, function(err, provider) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, provider);
  });
};

module.exports.updateProvider = function(req, res) {
  var prov = {
    name: req.body.name,
    slug: req.body.slug,
    description: req.body.description
  };
  Provider.findOneAndUpdate({_id: req.params.providerId}, prov, function(err, reply) {
    if(err) {
      code = (err.code === 11000)? STATUS.code(141, err) : STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {message: 'Provider updated'});
  });
};

module.exports.removeProvider = function(req, res) {
  Provider.findOneAndRemove({slug: req.params.providerId}, function(err) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {message: 'Provider deleted'});
  });
};
