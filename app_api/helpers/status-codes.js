var fs = require('fs')
  , buff = fs.readFileSync('./public/codes.json')
  , codes = JSON.parse(buff).status;

module.exports = {
  codes: codes,
  code: function(key, info) {
    var code = codes['GOTIT_' + key] || null;
    if(code && info) code.info = info;
    return code;
  }
};
