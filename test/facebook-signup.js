"use strict";

var request = require('supertest')
  , app = require('../app')
  , agent = request.agent(app)
  , User = require('../app_api/models/user');


describe('Signin FacebookStrategy', function() {

  it('Return 200 with a new User', function(done) {

    agent
      .get('/auth/facebook')
      .redirects(100)
      .end(function(err, res){
        console.log(res.status);
        console.log(res);
        done();
      });
  });





});
