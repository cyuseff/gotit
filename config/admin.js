'use strict';

var aerospike = require('./aero.js').aero
  , aero = require('./aero.js').client
  , User = require('../app_api/models/user')
  , Rol = require('../app_api/models/rol')
  , PASSWORD = '123456'
  , NAME = 'GotIt'
  , LAST_NAME = 'Admin'
  , EMAIL = 'admin@gotit.com'
  , rol;

function createRoles(cb) {
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
      rol.save(cb);
    } else {
      for(var i=0, l=roles.length; i<l; i++) {
        if(roles[i].name === 'superAdmin') {
          rol = roles[i];
          break;
        }
      }
      cb();
    }
  });
}

function createAdmin(cb) {
  User
    .findOne({fullName: NAME +' '+ LAST_NAME})
    .exec(function(err, admin) {
      if(err) console.log(err);
      if(admin) return cb();// console.log('Admin Found!');

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
          cb();
        });

      });

    });
}

createRoles(createAdmin(function() {
  console.log('Roles and Admin created');
  process.exit();
}));
