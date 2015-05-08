"use strict";

var request = require('supertest'),
  app = require('../app'),
  mongoose = require('mongoose');



describe('Login User', function(){

  it('Return a 200 status code', function(done) {

    request(app)
      .post('/login')
      .send('name=Admin&password=admin123')
      .expect(200, done);

  });

});
