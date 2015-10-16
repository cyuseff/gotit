'use strict';

var uuid = require('uuid');

/*
uuid: asd,
id: req.params.rolId,
scope: req.body.scope
*/

function UserRol(opts) {
  this.uuid = opts.uuid || uuid.v1();
  this.id = opts.id;
  this.scope = opts.scope;
}

UserRol.prototype.rolExistInUser = function(user) {
  for(var i=0, l=user.roles.length; i<l; i++) {
    if(this.id === user.roles[i].id && this.scope === user.roles[i].scope) return true;
  }
  return false;
};

module.exports = UserRol;
