'use strict';
/*jshint expr: true*/

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var should = require('should')
  , app = require(dirName + '/app')
  , Token = require(dirName + '/app_api/models/token')
  , aerospike = require(dirName + '/config/aero').aero
  , aero = require(dirName + '/config/aero').client
  , status = aerospike.status
  , token
  , ttlToken
  , staticSetToken
  , staticSetToken2
  , TTL = 20;

describe('Token Model', function() {
  before(function(done) {
    staticSetToken2 = new Token({
      set: 'test',
      sid: 'StaticTokens',
      data: {dummy: 'Token test 001'}
    });
    staticSetToken2.save(function(err, reply) {
      done();
    });
  });

  /*after(function(done) {
    Token.removeAllInSetbySid(ttlToken.set, ttlToken.sid, function(err, info) {
      console.log(err, info);
      done();
    });
  });*/

  it('Should create a new Token', function(done) {
    token = new Token({
      set: 'test',
      sid: 'token001',
      data: {dummy: 'Token test'}
    });
    should.exist(token);
    token.should.have.properties({
      set: 'test',
      sid: 'token001',
      data: JSON.stringify({dummy: 'Token test'})
    });
    token.should.have.property('createdAt').and.not.be.NaN();
    token.should.have.property('ttl').and.not.be.NaN();
    done();
  });

  it('Should save Token into the DB', function(done) {
    token.save(function(err, reply) {
      should.not.exist(err);
      should.exist(reply);
      token.should.have.property('jwToken').and.be.exactly(reply);
      done();
    });
  });

  it('Token should not have a TTL', function(done) {
    var udf = {
      module: 'scripts',
      funcname: 'getTTL'
    };
    aero.execute(aerospike.key('test', token.set, token.key), udf, function(err, ttl) {
      ttl.should.be.exactly(0);
      done();
    });
  });

  it('Token re-save should not generate a new jwToken', function(done) {
    token.save(function(err, reply) {
      token.jwToken.should.be.exactly(reply);
      done();
    });
  });

  it('Should create a Expirable Token', function(done) {
    ttlToken = new Token({
      set: 'test',
      sid: 'TTL001',
      data: {dummy: 'Token test with TTL'},
      ttl: TTL
    });

    ttlToken.save(function(err, jwt) {
      should.not.exist(err);
      ttlToken.should.have.property('ttl', TTL);

      var udf = {
        module: 'scripts',
        funcname: 'getTTL'
      };
      aero.execute(aerospike.key('test', ttlToken.set, ttlToken.key), udf, function(err, ttl) {
        ttl.should.be.approximately(TTL, 5);
        done();
      });
    });
  });

  it('Should find the token and return it', function(done) {
    Token.findByJwt(token.jwToken, function(err, reply) {
      should.not.exist(err);
      should.exist(reply);
      done();
    });
  });

  it('Should return an error with a invalid token', function(done) {
    Token.findByJwt('dummy', function(err, reply) {
      should.not.exist(reply);
      err.should.have.property('status', 400);
      done();
    });
  });

  it('Should find the token and and fail the validation', function(done) {
    Token.findByJwt(token.jwToken, function(err, reply) {
      should.exist(err);
      should.not.exist(reply);
      err.should.have.properties('code', 'status', 'msg');
      done();
    },
    false,
    function(token) { return false; });
  });

  it('Should find the token and pass the validation', function(done) {
    Token.findByJwt(token.jwToken, function(err, reply) {
      should.not.exist(err);
      should.exist(reply);
      reply.should.have.property('jwToken').be.exactly(token.jwToken);
      done();
    },
    false,
    function(token, decoded) {
      return (token.sid === 'token001' && token.sid === decoded.sid);
    });
  });

  it('Should find a expirable token and update his TTL', function(done) {
    var key = aerospike.key('test', ttlToken.set, ttlToken.key)
      , op = aerospike.operator;

    // increase the TTL
    aero.operate(key, [op.touch(100)], function() {
      var udf = {
        module: 'scripts',
        funcname: 'getTTL'
      };
      // Check the increased TTL
      aero.execute(key, udf, function(err, ttl) {
        ttl.should.be.approximately(100, 5);
        // Execute the find command with TOUCH enabled
        // this must return the TTL to his original value
        Token.findByJwt(ttlToken.jwToken, function(err, record) {
          should.not.exist(err);
          should.exist(record);

          // Check the touched TTL
          aero.execute(key, udf, function(err, ttl) {
            ttl.should.be.approximately(TTL, 5);
            done();
          });
        }, true);
      });
    });
  });

  it('Should find a expirable token and not update his TTL', function(done) {
    var key = aerospike.key('test', ttlToken.set, ttlToken.key)
      , op = aerospike.operator;

    // increase the TTL
    aero.operate(key, [op.touch(100)], function() {
      var udf = {
        module: 'scripts',
        funcname: 'getTTL'
      };
      // Check the increased TTL
      aero.execute(key, udf, function(err, ttl) {
        ttl.should.be.approximately(100, 5);
        // Execute the find command with TOUCH enabled
        // this must return the TTL to his original value
        Token.findByJwt(ttlToken.jwToken, function(err, record) {
          should.not.exist(err);
          should.exist(record);

          // Check the touched TTL
          aero.execute(key, udf, function(err, ttl) {
            ttl.should.be.approximately(100, 5);
            done();
          });
        }, false);
      });
    });
  });

  it('Should remove a token by JWT', function(done) {
    Token.removeByJwt(token.jwToken, function(err, reply) {
      should.not.exist(err);
      should.exist(reply);
      reply.should.have.property('message').match(/removed/i);
      done();
    });
  });

  it('Should fail to remove it again', function(done) {
    Token.removeByJwt(token.jwToken, function(err, reply) {
      should.not.exist(reply);
      err.should.have.property('status', 404);
      done();
    });
  });

  it('Should not found the removed token', function(done) {
    Token.findByJwt(token.jwToken, function(err, reply) {
      should.exist(err);
      should.not.exist(reply);
      err.should.have.property('status').be.exactly(404);
      done();
    }, true);
  });

  it('Should add a new token with a sid StaticTokens', function(done) {
    staticSetToken = new Token({
      set: 'test',
      sid: 'StaticTokens',
      data: {dummy: 'Token test 002'}
    });
    staticSetToken.save(function(err, jwt) {
      should.not.exist(err);
      jwt.should.be.exactly(staticSetToken.jwToken);
      done();
    });
  });

  it('Should return a list of Tokens', function(done) {
    Token.findAllInSetBySid(staticSetToken.set, staticSetToken.sid, function(err, reply) {
      should.not.exist(err);
      should.exist(reply);
      reply.should.be.Array();
      reply.length.should.be.above(1);
      done();
    });
  });

  it('Should update all tokens data in Set with the same sid', function(done) {
    var data = {timeStamp: Date.now()};
    Token.updateAllInSetBySid(staticSetToken.set, staticSetToken.sid, data, function(err, info) {
      should.not.exist(err);
      Token.findByJwt(staticSetToken.jwToken, function(err, updated) {
        updated.should.containDeepOrdered({data: {timeStamp: data.timeStamp }});
        done();
      });
    });
  });

  it('Should update all TTL tokens and don\'t modify their TTL', function(done) {
    var udf, data, ttl;
    udf = {
      module: 'scripts',
      funcname: 'getTTL'
    };
    data = {timeStamp: Date.now(), ttl: 'Updated'};

    // get current TTL
    aero.execute(aerospike.key('test', ttlToken.set, ttlToken.key), udf, function(err, n) {
      ttl = n;
      Token.updateAllInSetBySid(ttlToken.set, ttlToken.sid, data, function(err, info) {
        should.not.exist(err);
        Token.findByJwt(ttlToken.jwToken, function(err, updated) {
          should.not.exist(err);
          updated.should.containDeepOrdered({data: {timeStamp: data.timeStamp, ttl: 'Updated'}});
          aero.execute(aerospike.key('test', ttlToken.set, ttlToken.key), udf, function(err, nn) {
            nn.should.be.approximately(ttl, 5);
            done();
          });
        });
      });
    });
  });

  it('Should remove all token in Set with the same sid', function(done) {
    Token.removeAllInSetbySid(staticSetToken.set, staticSetToken.sid, function(err, info) {
      should.not.exist(err);
      info.should.have.property('removed').be.above(0);
      done();
    });
  });

});
