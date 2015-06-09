"use strict";

var request = require('supertest')
  , app = require('../app')
  , agent = request.agent(app)
  , User = require('../app_api/models/user');


describe('Signin LocalStrategy', function() {

  it('Return a 400 error missing fields', function(done) {

    agent
      .post('/api/auth/local')
      .send('email=admin@email.com')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/missing/i,done);

  });

  it('Return a 400 error password dont match', function(done) {

    agent
      .post('/api/auth/local')
      .send('email=admin@email.com&password=1234&confirm_password=4321')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/passwords\sdon\'t\smatch/i, done);

  });

  it('Return 200 with a new User', function(done) {

    agent
      .post('/api/auth/local')
      .send('email=admin@email.com&password=admin123&confirm_password=admin123&first_name=Cristián&last_name=Yuseff')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(/admin\@email\.com/i)
      .expect(/token/i, done)

  });

  it('Return 400 error "User exits!"', function(done) {

    agent
      .post('/api/auth/local')
      .send('email=admin@email.com&password=admin123&confirm_password=admin123')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/user\salready\sexits/i, done)

  });


  //Delete User
  after(function(done) {
    User.findOneAndRemove({email:'admin@email.com'})
    .exec(function(err) {
      if(err) console.log(err);
      done();
    });
  });



});
