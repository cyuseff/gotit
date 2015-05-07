"use strict";

var express = require('express');
var app = express();

//Database connection
require('./app_api/models/db.js');

//Api Routes
require('./app_api/routes')(app);

app.get('/', function(req, res){
  res.send('OK');
});





/** Handle Not Found Errors **/
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res
      .status(err.status || 500)
      .send({
        message: err.message,
        error: err
      });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res
    .status(err.status || 500)
    .send({
      message: err.message,
      error: 'Something gones wrong D;'
    });
});





module.exports = app;
