'use strict';

const BaseController = require(`../base_controller`);
const User = require(`../../..//app_api/models/user`);
const validator = require('validator');
const ctrl = new BaseController();


ctrl.localSignin = function(req, res) {
  let user;

  // Check password and confirmation
  if(req.body.password !== req.body.confirmPassword) {
    return this.answer(res, 400, {message: 'Passwords don\'t match'});
  }

  User
    .findOne({'local.email': email })
    .then((usr) => {
      if(usr) return this.answer(res, 409, {message: 'This email is already in use'});

      user = new User({
        emails: [req.body.email],
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        fullName: `${req.body.first_name} ${req.body.last_name}`,
        birthAt: req.body.birth_at,
        sex: req.body.sex,
        phone: req.body.phone,
        address: req.body.address,
        commune: req.body.commune,
        city: req.body.city
      });

      user
        .generateHash(req.body.password)
        .then(hash => {
          // add strategy properties
          user.local.email = req.body.email;
          user.local.password = hash;
        })
        .catch(e => this.answer(res, 500, {message: e.toString()}));
    })
    .catch(err => this.answer(res, 500, {message: 'Mongo Error.'}));
}

ctrl.localStrategy = function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirm_password;

  if(!email || !password) {
    return this.answer(res, 400, {message: 'Password and email required'});
  }

  // Check email
  if(!validator.isEmail(email, {allow_utf8_local_part: false})) {
    return this.answer(res, 400, {message: 'Invalid email address'});
  }

  // Check password
  if(!validator.isAlphanumeric(password)) {
    return this.answer(res, 400, {message: 'Password can only have alpha numerical characters'});
  }

  // Check password length
  if(password.length < 6 && confirmPassword) {
    return this.answer(res, 400, {message: 'Password must have at least 6 characthers length'});
  }


  if(!confirmPassword) {
    // Old user, start login flow
    this.localLogin(req, res, email, password);
  } else {
    // New user, start signin flow
    this.localSignin(req, res);
  }
};

module.exports = ctrl;
