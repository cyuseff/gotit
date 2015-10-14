var Reflux = require('reflux')
  , Actions = require('../actions')
  , Api = require('../utils/api');

module.exports = Reflux.createStore({
  rol: null,
  roles: null,

  listenables: [Actions],

  getRol: function(rolId) {
    Api.get('admin/roles/' +  rolId)
      .then(function(rol) {
        this.rol = rol;
        this.triggerChange();
      }.bind(this));
  },

  getRoles: function() {
    Api.get('admin/roles')
      .then(function(res) {
        this.roles = res.roles;
        this.triggerChange();
      }.bind(this));
  },

  removeRol: function(rolId) {
    Api.del('admin/roles/' + rolId)
      .then(function(res) {
        window.location.href = '/#/roles';
      });
  },

  triggerChange: function() {
    this.trigger('change');
  }
});
