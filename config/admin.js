'use strict';

var User = require('../app_api/models/user')
  , PASSWORD = '123456'
  , NAME = 'GotIt'
  , LAST_NAME = 'Admin'
  , EMAIL = 'admin@gotit.com';

User
  .findOne({fullName: 'GotIt Admin'})
  .exec(function(err, admin) {
    if(err) console.log(err);
    if(admin) return console.log('Admin Found!');

    // Create a new User
    var user = new User();
    user.generateHash(PASSWORD, function(err, hash) {

      if(err) return console.log(err);

      // Push to users emails array
      user.emails.push(EMAIL);

      // add general properties
      user.firstName = NAME;
      user.lastName = LAST_NAME;
      user.fullName = NAME + ' ' + LAST_NAME;

      // add strategy properties
      user.local.email = EMAIL;
      user.local.password = hash;

      // set as Admin
      user.admin = true;

      // save user before serialize into his token
      user.save(function(err) {
        if(err) return console.log(err);
        console.log('Admin Created!');
      });

    });

  });
