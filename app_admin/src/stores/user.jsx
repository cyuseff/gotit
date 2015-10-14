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

function getCookie() {
  return Cookies.get(COOKIE);
}

module.exports = Reflux.createStore({
  listenables: [Actions],

  // Local
  signIn: function(data) {
    Api.post('auth/local', data)
      .then(function(res) {
        this.token = res.token;
        this.user = res.user;
        setCookie(this.token);
        this.triggerChange();
      }.bind(this));
  },

  signOut: function() {
    Api.get('auth/logout')
      .then(function(res) {
        if(res.error) return;
        this.token = this.user = null;
        removeCookie();
        this.triggerChange();
        window.location.href = '/#';
      }.bind(this));
  },

  // Socials
  signInFacebook: function(id, token) {
    Api.post('auth/facebook', {id: id, token: token})
      .then(function(res) {
        if(res.error) return;
        this.token = res.token;
        this.user = res.user;
        setCookie(this.token);
        this.triggerChange();
      }.bind(this));
  },

  getProfile: function() {
    if(!getCookie()) {
      this.token = this.user = null;
      this.triggerChange();
      return;
    }
    Api.get('auth')
      .then(function(res) {
        if(res.error && res.error.code === 100) removeCookie();
        this.token = res.token;
        this.user = res.user;
        this.triggerChange();
      }.bind(this));
  },

  expireUser: function() {
    if(this.token) {
      console.log('expireUser');
      removeCookie();
      this.token = this.user = null;
      this.triggerChange();
    }
  },

  triggerChange: function() {
    this.trigger('change');
  }
});
