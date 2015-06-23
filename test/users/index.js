"use strict";

var request = require('supertest')
  , app = require('../../app')
  , agent = request.agent(app)
  //, User = require('../../app_api/models/user')
  , url = '/api/v1/users'
  , token;

describe('Users', function() {

  it('Return a 200 with a list of Users', function(done) {

    agent
      .get(url+'?page=1&per_page=1&fullName=yu&lastName=yu')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(/users/i,done);

  });

});
