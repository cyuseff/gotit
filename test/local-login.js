"use strict";

var request = require('supertest')
  , app = require('../app')
  , agent = request.agent(app)
  , User = require('../app_api/models/user');


describe('Login user', function() {


  //Create User
  var user
    , token
    , email = 'user001@test.com'
    , password = '123456'
    , firstName = 'User001'
    , lastName = 'Testo';

  before(function(done) {

    user = new User();
    user.generateHash(password, function(err, hash) {

      if(err) return done(null, false, err);

      //user's primary email, add to account emails list
      user.email = email;
      user.emails.push(email);

      //add general properties
      user.firstName = firstName;
      user.lastName = lastName;
      user.fullName = firstName + ' ' + lastName;

      //add strategy properties
      user.local.email = email;
      user.local.password = hash;

      //save user before serialize into his token
      user.save(function(err){
        if(err) return console.log(err);

        //create a session token
        user.generateToken(function(token){

          user.token = token;
          token = token;

          //save user token
          user.save(function(err){
            if(err)  return console.log(err);
            done();

          });

        });

      });

    });


  });




  it('Return a 400 error missing fields', function(done) {

    agent
      .post('/auth/local-login')
      .send('email=admin@email.com')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/missing/i, done);

  });

  it('Return a 400 error invalid Email', function(done) {

    agent
      .post('/auth/local-login')
      .send('email=admin@email&password=1234')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/invalid\semail/i,done);

  });

  it('Return a 400 error password characters error', function(done) {

    agent
      .post('/auth/local-login')
      .send('email=admin@email.com&password=aé')
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/alpha\snumerical\scharacters/i, done);

  });

  it('Return a 403 User not found', function(done) {

    agent
      .post('/auth/local-login')
      .send('email=admin@gmail.cl&password=aqweasdd')
      .expect(403)
      .expect('Content-Type', /json/)
      .expect(/user\snot\sfound/i, done);

  });

  it('Return a 403 password error', function(done) {

    agent
      .post('/auth/local-login')
      .send('email='+email+'&password=admin1231')
      .expect(403)
      .expect('Content-Type', /json/)
      .expect(/wrong\spassword/i, done);

  });

  it('Return a 200 User with token', function(done) {

    agent
      .post('/auth/local-login')
      .send('email='+email+'&password='+password)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(/user001\@test\.com/i)
      .expect(/token/i)
      .expect(token)
      .end(function(err, res){
        token = res.body.token;
        done();
      });

  });



  it('Return a 200 with user profile', function(done) {

    agent
      .get('/profile?token='+token)
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(/user001\@test\.com/i)
      .expect(/User001\sTesto/i)
      .end(function(err, res){
        done();
      });

  });


  after(function(done){
    user.remove(function(err){
      if(err) return console.log(err);
      console.log('User removed');
      done();
    });
  });





});
