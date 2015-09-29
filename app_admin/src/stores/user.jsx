var Reflux = require('reflux')
  , Actions = require('../actions')
  , Api = require('../utils/api')
  , Cookies = require('cookies-js')
  , COOKIE = 'gotit-token';

function setCookie(value) {
  if(value) Cookies.set(COOKIE, value);
}

function getCookie() {
  return Cookies.get(COOKIE);
}

function removeCookie() {
  Cookies.expire(COOKIE);
}

module.exports = Reflux.createStore({
  listenables: [Actions],
  logInUser: function(data) {
    Api.post('api/v1/auth/local', data)
      .then(function(res) {
        this.err = res.error;
        this.token = res.token;
        this.user = res.user;
        setCookie(this.token);
        this.triggerChange();
      }.bind(this));
  },
  logOutUser: function() {
    this.err = this.token = this.user = null;
    removeCookie();
    this.triggerChange();
  },
  checkCookies: function() {
    var token = getCookie();
    if(token) {
      Api.get('api/v1/me', token)
        .then(function(res) {
          console.log(res);
          if(res.error) return;
          this.token = token;
          this.user = res.user;
          this.triggerChange();
        }.bind(this));
    }
  },
  triggerChange: function() {
    this.trigger('change', this.err);
  }
});
