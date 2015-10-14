'use strict';

var User = require('../../../models/user')
  , Token = require('../../../models/token')
  , validator = require('validator')
	, hh = require('../../../helpers')
  , STATUS = require('../../../helpers/status-codes')
  , code;

var SET = 'users'
  , TTL = 360;

function localSignin(req, res, email, password, confirmPassword) {

  // Check password and confirmation
  if(password !== confirmPassword) {
    code = STATUS.code(123);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  User
    .findOne({'local.email': email })
    // .findOne({ emails:{ $in: [email] } })
    .exec(function(err, usr) {

      if(err) {
        code = STATUS.code(501, err);
        return hh.sendJsonResponse(res, code.status, {error: code});
      }
      if(usr) {
        code = STATUS.code(122, err);
        return hh.sendJsonResponse(res, code.status, {error: code});
      }

      // Create a new User
      var user = new User();
      user.generateHash(password, function(err, hash) {

        if(err) {
          code = STATUS.code(501, err);
          return hh.sendJsonResponse(res, code.status, {error: code});
        }

        // Push to users emails array
        user.emails.push(email);

        // add general properties
        user.firstName = req.body.first_name;
        user.lastName = req.body.last_name;
        user.fullName = req.body.first_name + ' ' + req.body.last_name;

        // add strategy properties
        user.local.email = email;
        user.local.password = hash;

        // save user before serialize into his token
        user.save(function(err) {
          if(err) {
            code = STATUS.code(501, err);
            return hh.sendJsonResponse(res, code.status, {error: code});
          }

          // create session token
          var token = new Token({
            set: SET,
            sid: user._id,
            data: user,
            ttl: TTL
          });
          token.save(function(err, jwToken) {
            // The user was created so send it back anyway even if token creation or aerospike fails
            if(err) console.log(err);
            return hh.sendJsonResponse(res, 201, {message: 'User created', user: user.getPublicUser(), token: jwToken});
          });

        });

      });

    });

}


function localLogin(req, res, email, password) {

  User.findOne({'local.email': email}, function(err, user) {

    if(err) {
      code = STATUS.code(501, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }
    if(!user) {
      code = STATUS.code(120, err);
      return hh.sendJsonResponse(res, code.status, {error: code});
    }

    // Check password
    user.comparePassword(password, function(err, isMatch) {
      if(err) {
        code = STATUS.code(501, err);
        return hh.sendJsonResponse(res, code.status, {error: code});
      }
      if(isMatch) {
        // create session token
        var token = new Token({
          set: SET,
          sid: user._id,
          data: user,
          ttl: TTL
        });
        token.save(function(err, jwToken) {
          // The user was created so send it back anyway even if token creation or redis fails
          if(err) {
            code = STATUS.code(501, err);
            return hh.sendJsonResponse(res, code.status, {error: code});
          }
          return hh.sendJsonResponse(res, 200, {user: user.getPublicUser(), token: jwToken});
        });
      } else {
        code = STATUS.code(134);
        return hh.sendJsonResponse(res, code.status, {error: code});
      }
    });


  });

}

module.exports.localStrategy = function(req, res) {
  var email = req.body.email
    , password = req.body.password
    , confirmPassword = req.body.confirm_password;

  if(!email || !password) {
    code = STATUS.code(130);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  // Check email
  if(!validator.isEmail(email, {allow_utf8_local_part: false})) {
    code = STATUS.code(131);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  // Check password
  if(!validator.isAlphanumeric(password)) {
    code = STATUS.code(132);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }

  // Check password length
  if(password.length < 6 && confirmPassword) {
    code = STATUS.code(133);
    return hh.sendJsonResponse(res, code.status, {error: code});
  }


  if(!confirmPassword) {
    // Old user, start login flow
    localLogin(req, res, email, password);
  } else {
    // New user, start signin flow
    localSignin(req, res, email, password, confirmPassword);
  }

};
