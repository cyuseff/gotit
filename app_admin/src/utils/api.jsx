var Fetch = require('whatwg-fetch')
  , ROOT_URL = '//localhost:5000/';

/*function checkStatus(res) {
  if (res.status >= 200 && res.status < 300) {
    return res;
  } else {
    console.log(res);
    var error = new Error(res.statusText);
    error.res = res;
    throw error;
  }
}*/

function parseJSON(res) {
  return res.json();
}

module.exports = {
  get: function(url) {
    return fetch(ROOT_URL + url, {})
      .then(function(res) {
        return res.json();
      });
  },
  post: function(url, data) {
    return fetch(ROOT_URL + url, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(parseJSON);
  }
};
