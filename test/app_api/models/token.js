'use strict';
/*jshint expr: true*/

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var should = require('should')
  , app = require(dirName + '/app')
  , Token = require(dirName + '/app_api/models/token')
  , redis = require(dirName + '/config/redis')
  , token
  , ttlToken
  , staticSetToken
  , staticSetToken2;

describe('Token Model', function() {
  before(function(done) {
    staticSetToken2 = new Token({
      prefix: 'test',
      id: 'Static002',
      data: {dummy: 'Token test with Static Set'},
      setKey: 'reset-pasword'
    });
    staticSetToken2.save(function(err, reply) {
      done();
    });
  });

  after('Remove all test Tokens', function(done) {
    Token.removeAllInSet(token.prefix, token.id, function() {
      Token.removeAllInSet(ttlToken.prefix, ttlToken.id, function() {
        done();
      });
    });
  });

  it('Should create a new Token', function(done) {
    token = new Token({
      prefix: 'test',
      id: 'token001',
      data: {dummy: 'Token test'}
    });

    should.exist(token);
    token.should.have.properties({prefix: 'test', id: 'token001', data: {dummy: 'Token test'}});
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

  it('Token should belong to a Token Set', function(done) {
    redis.SISMEMBER(token.setKey, token.key, function(err, reply) {
      should.not.exist(err);
      reply.should.be.exactly(1);
      done();
    });
  });

  it('Token should not have a TTL', function(done) {
    redis.TTL(token.key, function(err, reply) {
      should.not.exist(err);
      reply.should.be.exactly(-1);
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
      prefix: 'test',
      id: 'TTL001',
      data: {dummy: 'Token test with TTL'},
      expire: true
    });

    ttlToken.save(function(err, reply) {
      should.not.exist(err);
      ttlToken.should.have.property('expire').true();

      redis.TTL(ttlToken.key, function(err, reply) {
        should.not.exist(err);
        reply.should.be.above(1);
        done();
      });
    });
  });

  it('Should create a Static Set Token', function(done) {
    staticSetToken = new Token({
      prefix: 'test',
      id: 'Static001',
      data: {dummy: 'Token test with Static Set'},
      setKey: 'reset-pasword'
    });
    staticSetToken.save(function(err, reply) {
      should.not.exist(err);
      staticSetToken.setKey.should.be.exactly('got-it:test:set:reset-pasword');
      redis.SMEMBERS(staticSetToken.setKey, function(err, reply) {
        reply.should.be.Array();
        reply.length.should.be.above(1);
        reply.should.containDeep([staticSetToken.key, staticSetToken2.key]);
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
      err.should.have.properties('error', 'status');
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
      return (token.id === 'token001' && token.id === decoded.id);
    });
  });

  it('Should find a expirable token and update his TTL', function(done) {
    redis.EXPIRE(ttlToken.key, 100, function(err, reply) {
      Token.findByJwt(ttlToken.jwToken, function(err, reply) {
        should.not.exist(err);
        should.exist(reply);

        redis.TTL(reply.key, function(err, ttl) {
          ttl.should.be.approximately(3600, 10);
          done();
        });
      },
      true);
    });
  });

  it('Should find a expirable token and not update his TTL', function(done) {
    redis.EXPIRE(ttlToken.key, 100, function(err, reply) {
      Token.findByJwt(ttlToken.jwToken, function(err, reply) {
        should.not.exist(err);
        should.exist(reply);

        redis.TTL(reply.key, function(err, ttl) {
          ttl.should.be.approximately(100, 10);
          done();
        });
      },
      false);
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
    });
  });

  it('Token should not exist on his Set', function(done) {
    redis.SISMEMBER(token.setKey, token.key, function(err, reply) {
      should.not.exist(err);
      reply.should.be.exactly(0);
      done();
    });
  });

  it('When a token dont exist, should be removed from set when findByJwt()', function(done) {
    // insert the deleted key in set
    redis.SADD(token.setKey, token.key, function(err, reply) {
      // check the key in set
      redis.SMEMBERS(token.setKey, function(err, reply) {
        reply.should.containDeep([token.key]);
        // exec the find method
        Token.findByJwt(token.jwToken, function(err, reply) {
          should.exist(err);
          should.not.exist(reply);
          err.should.have.property('status').be.exactly(404);

          // check set in redis
          redis.SISMEMBER(token.setKey, token.key, function(err, reply) {
            should.not.exist(err);
            reply.should.be.exactly(0);
            done();
          });
        });
      });
    });
  });

  it('Should return a list of Tokens', function(done) {
    Token.findAllInSet(staticSetToken.prefix, 'reset-pasword', function(err, reply) {
      should.not.exist(err);
      should.exist(reply);
      reply.should.be.Array();
      reply.length.should.be.above(1);
      done();
    });
  });

  it('Should update all tokens data in Set', function(done) {
    var data = {timeStamp: Date.now()};
    Token.updateAllInSet(staticSetToken.prefix, 'reset-pasword', data, function(err, reply) {
      should.not.exist(err);
      should.exist(reply);
      reply.should.be.Array();
      reply.length.should.be.above(1);

      redis.GET(reply[0], function(err, updated) {
        updated = JSON.parse(updated);
        updated.should.containDeepOrdered({data: {timeStamp: data.timeStamp }});
        done();
      });
    });
  });

  it('When a token dont exist, should be removed from set when updateAllInSet()', function(done) {
    // add dummy token to set
    redis.SADD(staticSetToken.setKey, 'dummy-token', function(err, reply) {
      // check the dummy inside SET
      redis.SMEMBERS(staticSetToken.setKey, function(err, reply) {
        reply.should.containDeep(['dummy-token']);

        var data = {timeStamp: Date.now()};
        Token.updateAllInSet(staticSetToken.prefix, 'reset-pasword', data, function(err, reply) {
          should.not.exist(err);
          should.exist(reply);
          reply.should.be.Array();
          reply.should.not.containDeep(['dummy-token']);
          done();
        });
      });
    });
  });

  it('Should remove all token in Set and delete the Set', function(done) {
    Token.removeAllInSet(staticSetToken.prefix, 'reset-pasword', function(err, reply) {
      should.not.exist(err);
      reply.should.be.above(1);
      // check token key
      redis.EXISTS(staticSetToken.key, function(err, reply) {
        should.not.exist(err);
        reply.should.be.exactly(0);
        // check set
        redis.EXISTS(staticSetToken.setKey, function(err, reply) {
          should.not.exist(err);
          reply.should.be.exactly(0);
          done();
        });
      });
    });
  });

});
