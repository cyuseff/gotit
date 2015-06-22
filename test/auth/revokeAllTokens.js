"use strict";

var request = require('supertest')
  , app = require('../../app')
  , agent = request.agent(app)
  , User = require('../../app_api/models/user')
  , url = '/api/v1/auth/logoutAll'
  , redis = require('redis')
  , client = redis.createClient();

//Create User
var email = 'user002@test.com'
  , password = '123456'
  , firstName = 'User002'
  , lastName = 'Testo2'
  , token;


function generateRedisKey(id, cb) {
  var rand = Math.round(Math.random() * 10000000000);
  client.set('token:'+id+':'+rand, JSON.stringify({user:id}), function(err, reply){
    console.log(reply);
    cb();
  });
}

describe('Revoke all User Tokens', function() {

  before(function(done) {
    agent
      .post('/api/v1/auth/local')
      .send('email='+email+'&password='+password+'&confirm_password='+password+'&first_name='+firstName+'&last_name='+lastName)
      .expect(function(res){
        token = res.body.token;

        var ctrl = 0
          , max = 4
          , id = res.body.user._id;

        var cb = function() {
          ctrl++;
          if(ctrl >= max) {

          } else {
            generateRedisKey(id, cb);
          }
        }
        generateRedisKey(id, cb);
      })
      .end(done);

  });



  it('Return a 200, All tokens revoked', function(done) {
    agent
      .get(url)
      .set('x-access-token', token)
      .expect(200)
      .expect(/all\stokens\srevoked/i, done);
  });



  after(function(done){
    User.findOneAndRemove({'local.email':email}, function(err){
      if(err) console.log(err);
      done();
    });
  });

});
