"use strict";

var request = require('supertest')
  , app = require('../../app')
  , agent = request.agent(app)
  , User = require('../../app_api/models/user')
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
      .send('email=admin@email.com&password=12345')
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
      .expect(function(res){
        if(res.body.token) {
          token = res.body.token;
        } else {
          throw new Error("No token!");
        }
      })
      .end(done);

  });

  it('Return 409 error "User exits!"', function(done) {

    agent
      .post(url)
      .send('email=admin@email.com&password=admin123&confirm_password=admin123')
      .expect(409)
      .expect('Content-Type', /json/)
      .expect(/user\salready\sexits/i, done)

  });

  it('Return a 200, Token revoked', function(done) {
    agent
      .get('/api/v1/auth/logout')
      .set('x-access-token', token)
      .expect(200)
      .expect(/token\srevoked/i, done);
  });


  //Delete User
  after(function(done) {
    User.findOneAndRemove({'local.email':'admin@email.com'})
    .exec(function(err) {
      if(err) console.log(err);
      done();
    });
  });

});
