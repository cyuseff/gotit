var Reflux = require('reflux')
  , Actions = require('../actions')
  , Api = require('../utils/api');

module.exports = Reflux.createStore({
  user: null,
  users: null,

  listenables: [Actions],

  getUsers: function() {
    Api.get('admin/users')
      .then(function(res) {
        this.users = res.users;
        this.triggerChange();
      }.bind(this));
  },

  getUser: function(id) {
    Api.get('admin/users/' + id)
      .then(function(res) {
        this.user = res.user;
        this.triggerChange();
      }.bind(this));
  },

  addRolToUser: function(userId, rolId, scope) {
    Api.post('admin/roles/'+rolId+'/assign', {
      userId: userId,
      scope: scope
    })
    .then(function(res) {
      if(res.user) {
        this.user = res.user;
        this.triggerChange();
      }
    }.bind(this));
  },

  removeRolToUser: function(userId, rolId, scope) {
    Api.del('admin/roles/'+rolId+'/assign', {
      userId: userId,
      scope: scope
    })
    .then(function(res) {
      if(res.user) {
        this.user = res.user;
        this.triggerChange();
      }
    }.bind(this));
  },

  triggerChange: function() {
    this.trigger('change');
  }
});
