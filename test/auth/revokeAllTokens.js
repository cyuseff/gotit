'use strict';

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
  , token
  , max = 100;

describe('Revoke all User Tokens', function() {

  before(function(done) {
    agent
      .post('/api/v1/auth/local')
      .send('email='+email+'&password='+password+'&confirm_password='+password+'&first_name='+firstName+'&last_name='+lastName)
      .end(function(err, res){
        token = res.body.token;

        var ctrl = 0
          , id = res.body.user._id;

        console.log('Creating '+max+' Dummy tokens');

        var keys = [];
        var ss = [];
        for(var i=0; i<max; i++) {
          var rand = Math.round(Math.random() * 10000000000);
          keys.push('got-it:token:'+id+':'+rand);
          keys.push(JSON.stringify({user:id}));
          ss.push('got-it:token:'+id+':'+rand);
        }

        client.multi()
          .mset(keys)
          .sadd('got-it:token:user-set:'+id, ss)
          .exec(function(err, reply){
            done();
          });

      });

  });



  it('Return a 200, All tokens revoked', function(done) {
    agent
      .get(url)
      .set('x-access-token', token)
      .expect(200)
      .expect(new RegExp(max+2))
      .expect(/all\stokens\srevoked/i)
      .end(function(err, res) {
        //console.log(res.body);
        done();
      });
  });



  after(function(done){
    User.findOneAndRemove({'local.email':email}, function(err){
      if(err) console.log(err);
      done();
    });
  });

});
