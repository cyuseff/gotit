'use strict';

const BaseController = require('../../base_controller');
const Token = require('../../../../app_api/models/token');
const ctrl = new BaseController();

ctrl.logout = function(req, res) {
  const jwt = req.body.token || req.query.token || req.headers['x-access-token'];
  if(!jwt) return this.answer(res, 403, {message: 'No token provided.'});

  Token
    .removeByJwt(jwt)
    .then(() => this.answer(res, 204, {}))
    .catch(err => this.answer(res, 400, {message: err}));
};

ctrl.logoutAll = function(req, res) {
  const jwt = req.body.token || req.query.token || req.headers['x-access-token'];

  if(!jwt) return this.answer(res, 403, {message: 'No token provided.'});

  Token
    .findByJwt(jwt)
    .then(token => {
      Token
        .removeSet(token.model, token.owner)
        .then(() => this.answer(res, 204, {}))
        .catch(err => this.answer(res, 400, {message: err}));
    })
    .catch(err => this.answer(res, 400, {message: err}));
};

module.exports = ctrl;
