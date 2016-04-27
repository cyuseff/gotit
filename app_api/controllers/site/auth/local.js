'use strict';

const BaseController = require(`${__base}/app_api/controllers/base_controller`);
const User = require(`${__base}/app_api/models/user`);
const validator = require('validator');
const ctrl = new BaseController();


ctrl.localSignin = function(req, res, email, password, confirmPassword) {

  // Check password and confirmation
  if(password !== confirmPassword) {
    return this.answer(res, 400, {message: 'Passwords don\'t match'});
  }

  User
    .findOne({'local.email': email })
    // .findOne({ emails:{ $in: [email] } })
    .exec((err, usr) => {
      if(err) return this.answer(res, 500, {message: 'Mongo error'});
      if(usr) return this.answer(res, 409, {message: 'This email is already in use'});

      // Create a new User
      var user = new User();
      user.generateHash(password, (err, hash) => {

        if(err) return this.answer(res, 500, {message: 'Opps!'});

        // Push to users emails array
        user.emails.push(email);

        // add general properties
        user.firstName = req.body.first_name;
        user.lastName = req.body.last_name;
        user.fullName = `${req.body.first_name} ${req.body.last_name}`;

        // add strategy properties
        user.local.email = email;
        user.local.password = hash;

        // save user before serialize into his token
        user.save((err) => {
          if(err) return this.answer(res, 500, {message: 'Mongo error'});

          this.answer(res, 201, {id: user._id, location: `/api/v1/users/${user._id}`});

          // create session token
          /*var token = new Token({
            set: SET,
            sid: user._id,
            data: user,
            ttl: TTL
          });
          token.save(function(err, jwToken) {
            // The user was created so send it back anyway even if token creation or aerospike fails
            if(err) console.log(err);
            return hh.sendJsonResponse(res, 201, {message: 'User created', user: user.getPublicUser(), token: jwToken});
          });*/

        });

      });

    });

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
    this.localSignin(req, res, email, password, confirmPassword);
  }
};

module.exports = ctrl;
