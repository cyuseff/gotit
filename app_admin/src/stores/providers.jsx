var Reflux = require('reflux')
  , Actions = require('../actions')
  , Api = require('../utils/api');

module.exports = Reflux.createStore({
  provider: null,
  providers: null,

  listenables: [Actions],

  getProviders: function() {
    Api.get('admin/providers')
      .then(function(res) {
        this.providers = res.providers;
        this.triggerChange();
      }.bind(this));
  },
  getProvider: function(providerId) {
    Api.get('admin/providers/' + providerId)
      .then(function(provider) {
        this.provider = provider;
        this.triggerChange();
      }.bind(this));
  },
  removeProvider: function(providerId) {
    Api.del('admin/providers/' + providerId)
      .then(function(res) {
        window.location.href = '/#/providers';
      });
  },

  triggerChange: function() {
    this.trigger('change');
  }
});
