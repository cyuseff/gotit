var Fetch = require('whatwg-fetch')
  , Reflux = require('reflux')
  , UserStore = require('../stores/user')
  , Actions = require('../actions')
  , Cookies = require('cookies-js')
  , COOKIE = 'gotit-token'
  , ROOT_URL = '//localhost:5000/api/v1/';

function getOpts(method, data) {
  var opts = {
    method: (method || 'get'),
    headers: getHeader()
  };

  if(data) opts.body = JSON.stringify(data);
  return opts;
}

function getHeader() {
  var token = Cookies.get(COOKIE);
  var header = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  };
  if(token) header['x-access-token'] = token;
  return header;
}

function parseJSON(res) {
  return res.json();
}

function _fetch(method, url, data, absolutePath) {
  return fetch((absolutePath? url : ROOT_URL + url), getOpts(method, data))
    .then(function(res) {
      return parseJSON(res);
    })
    .then(function(res) {
      if(res.error && res.error.code === 100) Actions.expireUser();
      Actions.setFlashMessage(res.error, res.message);
      return res;
    });
}

module.exports = {
  get:    function(url, data) { return _fetch('get', url, data); },
  post:   function(url, data) { return _fetch('post', url, data); },
  put:    function(url, data) { return _fetch('put', url, data); },
  del:    function(url, data) { return _fetch('delete', url, data); },
  fetch:  function(method, url, data) { return _fetch(method, url, data, true) }
};
