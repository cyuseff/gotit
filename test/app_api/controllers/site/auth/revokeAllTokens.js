'use strict';

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var request = require('supertest')
  , app = require(dirName + '/app')
  , agent = request.agent(app)
  , User = require(dirName + '/app_api/models/user')
  , url = '/api/v1/auth/logoutAll'
  , aerospike = require(dirName + '/config/aero').aero
  , aero = require(dirName + '/config/aero').client
  , status = aerospike.status;

// Create User
var email = 'user002@test.com'
  , password = '123456'
  , firstName = 'User002'
  , lastName = 'Testo2'
  , token
  , max = 100;

describe('Revoke all User Tokens', function() {

  before(function(done) {
    agent
      .post('/api/v1/auth/local')
      .send('email='+email+'&password='+password+'&confirm_password='+password+'&first_name='+firstName+'&last_name='+lastName)
      .end(function(err, res) {
        token = res.body.token;

        var ctrl = 0
          , id = res.body.user._id.toString();

        var cb = function() {
          ctrl++;
          if(ctrl >= max) done();
        };

        // console.log('Creating '+max+' Dummy tokens');
        for(var i=0; i<max; i++) {
          var rand = Math.round(Math.random() * 10000000000);
          aero.put(aerospike.key('test', 'users', 'pk'+rand), {key: 'pk'+rand, sid: id}, cb);
        }
      });

  });



  it('Return a 200, All tokens revoked', function(done) {
    agent
      .get(url)
      .set('x-access-token', token)
      .expect(200)
      .expect(new RegExp(max+1))
      .expect(/all\suser\stokens\srevoked/i, done);
  });



  after(function(done) {
    User.findOneAndRemove({'local.email': email}, function(err) {
      if(err) console.log(err);
      done();
    });
  });

});
