var Reflux = require('reflux');

module.exports = Reflux.createActions([
  'signIn',
  'signOut',
  'signInFacebook',
  'getProfile',
  'expireUser',

  'getRoles',
  'getRol',
  'removeRol',

  'getUsers',
  'getUser',
  'addRolToUser',
  'removeRolToUser',

  'setFlashMessage'
]);
