'use strict';

const Token = require('../models/token');

class BaseController {
  answer(res, status, data) {
    BaseController._answer(res, status, data);
  }

  static _answer(res, status, data) {
    res.status(status).json(data);
  }

  static authToken(req, res, next) {
    const jwt = req.body.token || req.query.token || req.headers['x-access-token'];
    let data;
    if(jwt) {
      Token
        .findByJwt(jwt, true, (t, d) => {
          data = JSON.parse(t.data);
          return (
            t.id === d.id
            && t.model === d.model
            && t.owner === d.owner
            && d.owner === data.id
          );
        })
        .then(obj => {
          req.user = data;
          next();
        })
        .catch(err => BaseController._answer(res, err.status, {message: err.toString()}));
    } else {
      return BaseController._answer(res, 401, {message: 'Authorization required.'});
    }
  }
}

module.exports = BaseController;
