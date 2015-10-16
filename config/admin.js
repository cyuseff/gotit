'use strict';

var aerospike = require('./aero.js').aero
  , aero = require('./aero.js').client
  , User = require('../app_api/models/user')
  , Rol = require('../app_api/models/rol')
  , UserRol = require('../app_api/models/user-rol')
  , Mongo = require('./mongoose')
  , PASSWORD = '123456'
  , NAME = 'GotIt'
  , LAST_NAME = 'Admin'
  , EMAIL = 'admin@gotit.com'
  , rol;

function createRoles(cb) {
  Rol.findAll(function(err, roles) {
    if(!roles || !roles.length) {
      rol = new Rol({
        name: 'Super Admin',
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
      console.log('Rol Found!');
      for(var i=0, l=roles.length; i<l; i++) {
        if(roles[i].name === 'Super Admin') {
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
      if(admin) {
        console.log('Admin Found!');
        return cb();
      }

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
        var userRol = new UserRol({
          id: rol.id,
          scope: '*'
        });
        user.roles.push(userRol);

        // save user before serialize into his token
        user.save(function(err) {
          if(err) return console.log(err);
          console.log('Admin Created!');
          cb();
        });

      });

    });
}

function removeAllRoles(callback) {
  var n = 0;
  Rol.findAll(function(err, roles) {
    if(!roles || !roles.length) {
      console.log('No Roles found!');
      return callback();
    }
    var cb = function() {
      n++;
      if(n === roles.length) {
        console.log('All rol removed');
        callback();
      }
    };
    for(var i=0, l=roles.length; i<l; i++) Rol.remove(roles[i].id, cb);
  });
}

function removeAllUsers(callback) {
  User.remove({}, function(err, reply) {
    if(err) return console.log(err);
    return callback();
  });
}

function setAdmins() {
  createRoles(function() {
    createAdmin(function() {
      console.log('Roles and Admin created');
      process.exit();
    });
  });
}

if(process.env.NODE_ENV === 'reset') {
  removeAllRoles(function() {
    removeAllUsers(function() {
      setAdmins();
    });
  });
} else {
  setAdmins();
}

/*createRoles(createAdmin(function() {

}));*/
