'use strict';

const BaseController = require('../base_controller');
const User = require('../../../app_api/models/user');
const ctrl = new BaseController();

ctrl.list = function(req, res) {
  const projection = {
    fullName: 1,
    emails: 1
  };

  User
    .find({}, projection)
    .exec((err, users) => {
      if(err) return this.answer(res, 500, {message: 'Internal Server Error.'});
      this.answer(res, 200, {users: users});
    });
};

module.exports = ctrl;
