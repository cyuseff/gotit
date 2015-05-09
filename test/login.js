"use strict";

var request = require('supertest'),
  app = require('../app');


var agent = request.agent(app);


describe('Login User', function(){

  it('Return User with a 200 and cookie', function(done) {

    agent
      .post('/login')
      .send('username=Admin&password=admin123')
      .expect(200)
      .expect('set-cookie', /got-it/)
      .expect(/admin/i,done);

  });

  it('Get a private route', function(done){
    agent
      .get('/private')
      .expect(200, done);
  });

  it('Logout user', function(done){
    agent
      .get('/logout')
      .expect(200)
      .expect(/bye/, done);
  });

  it('Denied private route', function(done){
    agent
      .get('/private')
      .expect(401, done);
  });

  it('Return Invalid password with a 401', function(done) {

    request(app)
      .post('/login')
      .send('username=Admin&password=admin')
      .expect(401)
      .expect(/invalid\spassword/i,done);

  });



});
