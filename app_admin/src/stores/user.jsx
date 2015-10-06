var Reflux = require('reflux')
  , Actions = require('../actions')
  , Api = require('../utils/api')
  , Cookies = require('cookies-js')
  , COOKIE = 'gotit-token';

function setCookie(value) {
  if(value) Cookies.set(COOKIE, value);
}

function removeCookie() {
  Cookies.expire(COOKIE);
}

module.exports = Reflux.createStore({
  listenables: [Actions],
  signInUser: function(data) {
    Api.post('auth/local', data)
      .then(function(res) {
        this.err = res.error;
        this.token = res.token;
        this.user = res.user;
        setCookie(this.token);
        this.triggerChange();
      }.bind(this));
  },
  logInUser: function(data) {
    Api.post('auth/local', data)
      .then(function(res) {
        this.err = res.error;
        this.token = res.token;
        this.user = res.user;
        setCookie(this.token);
        this.triggerChange();
      }.bind(this));
  },
  logOutUser: function() {
    Api.get('auth/logout')
      .then(function(res) {
        if(res.error) return;
        this.err = this.token = this.user = null;
        removeCookie();
        this.triggerChange();
      }.bind(this));
  },
  getProfile: function() {
    Api.get('auth')
      .then(function(res) {
        if(res.error) return;
        this.token = res.token;
        this.user = res.user;
        this.triggerChange();
      }.bind(this));
  },
  logInFacebook: function(id, token) {
    Api.post('auth/facebook', {id: id, token: token})
      .then(function(res) {
        if(res.error) return;
        this.token = res.token;
        this.user = res.user;
        setCookie(this.token);
        this.triggerChange();
      }.bind(this));
  },
  triggerChange: function() {
    this.trigger('change');
  }
});
