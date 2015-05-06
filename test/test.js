var request = require('supertest');
var app = require('../app');

describe('Request to the root path', function(){

  it('Return a 200 status code', function(done) {

    request(app)
      .get('/')
      .expect(200)
      .end(function(error){
        if(error) throw error;
        done();
      });

  });

});
