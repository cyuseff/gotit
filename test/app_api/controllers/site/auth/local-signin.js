'use strict';

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var request = require('supertest')
  , app = require(dirName + '/app')
  , agent = request.agent(app)
  , User = require(dirName + '/app_api/models/user')
  , url = '/api/v1/auth/local'
  , token;

describe('Signin LocalStrategy', function() {

  it('Return a 400 error missing credentials', function(done) {
    agent
      .post(url)
      .send('email=admin@email.com')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/missing/i,done);
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

  it('Return a 400 error password length error', function(done) {
    agent
      .post(url)
      .send('email=admin@email.com&password=12345&confirm_password=12345')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/\d\scharacthers\slength/i, done);
  });

  it('Return a 400 error password dont match', function(done) {
    agent
      .post(url)
      .send('email=admin@email.com&password=123456&confirm_password=654321')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/passwords\sdon\'t\smatch/i, done);
  });

  it('Return 201 with a new User', function(done) {
    agent
      .post(url)
      .send('email=admin@email.com&password=admin123&confirm_password=admin123&first_name=Cristián&last_name=Yuseff')
      .expect(201)
      .expect('Content-Type', /json/)
      .expect(/admin\@email\.com/i)
      .expect(function(res) {
        if(!res.body.token) throw new Error('No token');
        token = res.body.token;
      })
      .end(done);
  });

  it('Return 409 error "User exits!"', function(done) {
    agent
      .post(url)
      .send('email=admin@email.com&password=admin123&confirm_password=admin123')
      .expect(409)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        if(res.body.error.code !== 122) throw new Error('Code error don\'t match.');
      })
      .end(done);
  });

  it('Signed out user', function(done) {
    agent
      .get('/api/v1/auth/logout')
      .set('x-access-token', token)
      .expect(200)
      .expect(/signed out/i, done);
  });


  // Delete User
  after(function(done) {
    User.findOne({'local.email': 'admin@email.com'}, function(err, user) {
      if(err) console.log(err);
      user.remove(function(err) {
        done();
      });
    });
  });

});
