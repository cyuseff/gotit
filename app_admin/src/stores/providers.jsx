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

  triggerChange: function() {
    this.trigger('change');
  }
});
