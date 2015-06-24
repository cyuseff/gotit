"use strict";

var request = require('supertest')
  , app = require('../../app')
  , agent = request.agent(app)
  , User = require('../../app_api/models/user')
  , url = '/api/v1/users';

//Create User
var email = 'user001@test.com'
  , password = '123456'
  , firstName = 'User001'
  , lastName = 'Testo'
  , userid
  , token;

describe('Users', function() {

  before(function(done) {
    agent
      .post('/api/v1/auth/local')
      .send('email='+email+'&password='+password+'&confirm_password='+password+'&first_name='+firstName+'&last_name='+lastName)
      .expect(function(res){
        userid = res.body.user._id;
        token = res.body.token;
      })
      .end(done);
  });

  it('Return a 200 with a list of Users', function(done) {

    agent
      .get(url+'?page=1&per_page=1&fullName=yu&lastName=yu')
      .set('x-access-token', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(/users/i,done);

  });

  it('Return a 200 with a User', function(done) {

    agent
      .get(url+'/'+userid)
      .set('x-access-token', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(function(res){
        if(res.body.user._id !== userid) throw new Error("No ID!");
      })
      .end(done);

  });

  after(function(done){
    User.findOneAndRemove({'local.email':email}, function(err){
      if(err) console.log(err);
      done();
    });
  });

});
