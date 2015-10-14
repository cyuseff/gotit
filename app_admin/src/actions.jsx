var Reflux = require('reflux');

module.exports = Reflux.createActions([
  'signIn',
  'signOut',
  'signInFacebook',
  'getProfile',
  'expireUser',

  'getRoles',
  'getRol',

  'getUsers',
  'getUser',
  'addRolToUser',
  'removeRolToUser'
]);
