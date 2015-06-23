"use strict";

var hh = require('../../helpers');

module.exports = function(app) {
  require('./auth')(app);
  require('./users')(app);

  app.get('/private', hh.authToken, function(req, res){
    hh.sendJsonResponse(res, 200, {message: 'This content is private!', user: req.user})
  });

}
