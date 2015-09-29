var Reflux = require('reflux')
  , Actions = require('../actions')
  , Api = require('../utils/api');

module.exports = Reflux.createStore({
  listenables: [Actions],
  logInUser: function(data) {
    Api.post('api/v1/auth/local', data)
      .then(function(res) {
        this.err = res.error;
        this.token = res.token;
        this.user = res.user;
        this.triggerChange();
      }.bind(this));
  },
  logOutUser: function() {
    this.err = this.token = this.user = null;
    this.triggerChange();
  },
  triggerChange: function() {
    this.trigger('change', this.err);
  }
});
