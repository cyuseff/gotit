'use strict';

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var request = require('supertest')
  , app = require(dirName + '/app')
  , agent = request.agent(app)
  , User = require(dirName + '/app_api/models/user')
  , url = '/api/v1/users';

// Create User
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
      .expect(function(res) {
        userid = res.body.user._id;
        token = res.body.token;
      })
      .end(done);
  });

  it('Return a 200 with a list of Users', function(done) {
    agent
      .get(url+'?page=1&per_page=15&full_name=cris&order_by=test')
      .set('x-access-token', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(/users/i, done);
  });

  it('Return a 200 with a User', function(done) {
    agent
      .get(url+'/'+userid)
      .set('x-access-token', token)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect(function(res) {
        if(res.body.error) throw new Error(res.body.error);
        if(res.body.user) {
          if(res.body.user._id !== userid) throw new Error('ID don\'t match!');
        } else {
          throw new Error('No user!');
        }
      })
      .end(done);
  });

  it('Return a 400 with a no User found error', function(done) {
    agent
      .get(url+'/55860c3dfed88414e05a69c1')
      .set('x-access-token', token)
      .expect(400)
      .expect('Content-Type', /json/)
      .expect(/no\suser\sfound/i)
      .end(done);
  });

  it('Return a 500, with a ObjectID not valid', function(done) {
    agent
      .get(url+'/1234')
      .set('x-access-token', token)
      .expect(500)
      .expect('Content-Type', /json/)
      .end(done);
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
