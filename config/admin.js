'use strict';

var User = require('../app_api/models/user')
  , Rol = require('../app_api/models/rol')
  , PASSWORD = '123456'
  , NAME = 'GotIt'
  , LAST_NAME = 'Admin'
  , EMAIL = 'admin@gotit.com'
  , P_NAME = 'Provider'
  , P_LAST_NAME = 'Admin'
  , P_EMAIL = 'provider-admin@gotit.com';

var rol, rol2, rol3;

Rol.findAll(function(err, roles) {
  if(!roles || !roles.length) {
    rol = new Rol({
      name: 'superAdmin',
      accessLevel: 1,
      routes: [
        {
          url: ':scope',
          methods: '*',
          recursive: 1
        }
      ]
    });
    rol.save();

    rol2 = new Rol({
      name: 'providerAdmin',
      accessLevel: 2,
      routes: [
        {
          url: 'providers/:scope',
          methods: '*',
          recursive: 1
        }
      ]
    });
    rol2.save();

    rol3 = new Rol({
      name: 'providerNestedAdmin',
      accessLevel: 3,
      routes: [
        {
          url: 'providers/:scope/nested',
          methods: '*',
          recursive: 0
        }
      ]
    });
    rol3.save();
  }

  User
    .findOne({fullName: NAME +' '+ LAST_NAME})
    .exec(function(err, admin) {
      if(err) console.log(err);
      if(admin) return; // console.log('Admin Found!');

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

        // Assign SuperAdmin Rol
        user.roles.push({
          id: rol.id,
          scope: '*'
        });

        // save user before serialize into his token
        user.save(function(err) {
          if(err) return console.log(err);
          console.log('Admin Created!');
        });

      });

    });

  User
    .findOne({fullName: P_NAME +' '+ P_LAST_NAME})
    .exec(function(err, admin) {
      if(err) console.log(err);
      if(admin) return; // console.log('Provider Admin Found!');

      // Create a new User
      var user = new User();
      user.generateHash(PASSWORD, function(err, hash) {

        if(err) return console.log(err);

        // Push to users emails array
        user.emails.push(P_EMAIL);

        // add general properties
        user.firstName = P_NAME;
        user.lastName = P_LAST_NAME;
        user.fullName = P_NAME + ' ' + P_LAST_NAME;

        // add strategy properties
        user.local.email = P_EMAIL;
        user.local.password = hash;

        /*// set as Admin
        user.admin = true;

        // Assign SuperAdmin Rol
        user.roles.push({
          id: rol2.id,
          scope: '3'
        });*/

        // save user before serialize into his token
        user.save(function(err) {
          if(err) return console.log(err);
          // console.log('Provider Admin Created!');
        });

      });

    });

});
