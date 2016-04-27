'use strict';

class BaseController {
  answer(res, status, data) {
    res.status(status).json(data);
  }
}

module.exports = BaseController;
