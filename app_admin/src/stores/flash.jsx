var Reflux = require('reflux')
  , Actions = require('../actions');

module.exports = Reflux.createStore({

  listenables: [Actions],

  setFlashMessage: function(err, msg) {
    this.err = err? err.message : null;
    this.msg = msg || null;
    this.triggerChange();
  },

  triggerChange: function() {
    this.trigger('change');
  }
});
