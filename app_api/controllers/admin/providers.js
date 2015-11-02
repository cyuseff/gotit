'use strict';

var Provider = require('../../models/provider')
  , hh = require('../../helpers')
  , STATUS = require('../../helpers/status-codes')
  , code;

// TODO: this function should delete all version
// and create a version based on every location and saved
// to location-version collection
function updateVersions(provider) {

}

module.exports.list = function(req, res) {
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

module.exports.create = function(req, res) {
  var name = req.body.name.trim()
    , slug = req.body.slug.trim()
    , description = req.body.description.trim();

  if(!name || !slug || !description) {
    code = STATUS.code(114);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  var prov = new Provider({
    name: name,
    slug: slug,
    description: description,
    locations: req.body.locations
  });

  prov.save(function(err) {
    if(err) {
      code = (err.code === 11000)? STATUS.code(141, err) : STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 201, {message: 'Provider created', provider: prov});
  });
};

module.exports.show = function(req, res) {
  Provider.findOne({slug: req.params.providerId}, function(err, provider) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    if(!provider) {
      code = STATUS.code(140, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, provider);
  });
};

module.exports.update = function(req, res) {
  var prov = {}
    , name = req.body.name.trim()
    , slug = req.body.slug.trim()
    , description = req.body.description.trim();

  if(name) prov.name = name;
  if(slug) prov.slug = slug;
  if(description) prov.description = description;
  if(req.body.locations && req.body.locations.length) prov.locations = req.body.locations;

  Provider.findOneAndUpdate({slug: req.params.providerId}, prov, {new: true}, function(err, provider) {
    if(err) {
      code = (err.code === 11000)? STATUS.code(141, err) : STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    if(!provider) {
      code = STATUS.code(140, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {message: 'Provider updated', provider: provider});
  });
};

module.exports.remove = function(req, res) {
  Provider.findOneAndRemove({slug: req.params.providerId}, function(err) {
    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    return hh.sendJsonResponse(res, 200, {message: 'Provider deleted'});
  });
};
