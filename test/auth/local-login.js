"use strict";

var request = require('supertest')
  , app = require('../../app')
  , agent = request.agent(app)
  , User = require('../../app_api/models/user')
  , url = '/api/v1/auth/local';

//Create User
var email = 'user001@test.com'
  , password = '123456'
  , firstName = 'User001'
  , lastName = 'Testo'
  , token;


describe('Login user', function() {

  before(function(done) {
    agent
      .post('/api/v1/auth/local')
      .send('email='+email+'&password='+password+'&confirm_password='+password+'&first_name='+firstName+'&last_name='+lastName)
      .end(function(){
        done();
      });
  });




  it('Return a 400 error missing fields', function(done) {

    agent
      .post(url)
      .send('email=admin@email.com')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/missing/i, done);

  });

  it('Return a 400 error invalid Email', function(done) {

    agent
      .post(url)
      .send('email=admin@email&password=1234')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/invalid\semail/i,done);

  });

  it('Return a 400 error password characters error', function(done) {

    agent
      .post(url)
      .send('email=admin@email.com&password=aé')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/alpha\snumerical\scharacters/i, done);

  });

  it('Return a 403 User not found', function(done) {

    agent
      .post(url)
      .send('email=admin@gmail.cl&password=aqweasdd')
      .expect(403)
      .expect('Content-Type', /json/)
      .expect(/user\snot\sfound/i, done);

  });

  it('Return a 403 password error', function(done) {

    agent
      .post(url)
      .send('email='+email+'&password=admin1231')
      .expect(403)
      .expect('Content-Type', /json/)
      .expect(/wrong\spassword/i, done);

  });

  it('Return a 200 User with token', function(done) {

    agent
      .post(url)
      .send('email='+email+'&password='+password)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(/user001\@test\.com/i)
      .expect(function(res){
        if(res.body.token) {
          token = res.body.token;
        } else {
          throw new Error("No token!");
        }
      })
      .end(done);

  });

  it('Return a 200 with private content', function(done) {
    agent
      .get('/private')
      .set('x-access-token', token)
      .expect(200)
      .expect(/content\sis\sprivate/i, done);
  });

});


describe('Logout user', function() {

  it('Return a 400 error, No token provided', function(done) {
    agent
      .get('/api/v1/auth/logout')
      .expect(400)
      .expect(/no\stoken/i, done);
  });

  it('Return a 200, Token revoked', function(done) {
    agent
      .get('/api/v1/auth/logout')
      .set('x-access-token', token)
      .expect(200)
      .expect(/token\srevoked/i, done);
  });

  after(function(done){
    User.findOneAndRemove({'local.email':email}, function(err){
      if(err) console.log(err);
      done();
    });
  });

});
