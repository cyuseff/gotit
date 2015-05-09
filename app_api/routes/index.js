"use strict";

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.sendStatus(401);
}

module.exports = function(app){

  app.all('/api/*', ensureAuthenticated);

  require('./users')(app);
}
