var Reflux = require('reflux')
  , Actions = require('../actions');

module.exports = Reflux.createStore({

  listenables: [Actions],

  setFlashMessage(err, msg) {
    this.err = err? err.msg : null;
    this.msg = msg || null;
    this.triggerChange();
  },

  triggerChange: function() {
    this.trigger('change');
  }
});
