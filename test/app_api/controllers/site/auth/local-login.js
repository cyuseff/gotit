'use strict';

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var request = require('supertest')
  , app = require(dirName + '/app')
  , agent = request.agent(app)
  , User = require(dirName + '/app_api/models/user')
  , url = '/api/v1/auth/local';

// Create User
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
      .end(function() {
        done();
      });
  });

  it('Return a 400 error missing fields', function(done) {
    agent
      .post(url)
      .send('email=admin@email.com')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/missing\scredentials/i, done);
  });

  it('Return a 400 error invalid Email', function(done) {
    agent
      .post(url)
      .send('email=admin@email&password=1234')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/invalid\semail/i, done);
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
      .end(function(err, res) {
        if(!res.body.token) throw new Error('No token found');
        token = res.body.token;
        done();
      });
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

  it('Denied private with a 403, Token not found', function(done) {
    agent
      .get('/private')
      .set('x-access-token', token)
      .expect(403)
      .expect(/token\snot\sfound/i, done);
  });

  after(function(done) {
    User.findOne({'local.email': email}, function(err, user) {
      if(err) console.log(err);
      user.remove(function(err) {
        done();
      });
    });
  });

});
