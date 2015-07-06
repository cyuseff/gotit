'use strict';

module.exports = function(app) {
  app.get('/fb', function(req, res){
    res.render('fb.ejs');
  });
};
