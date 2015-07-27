'use strict';
/*jshint expr: true*/

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var should = require('should')
  , app = require(dirName + '/app')
  , Token = require(dirName + '/app_api/models/_token')
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
    staticSetToken2.save(done);
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
      token.should.have.property('publicToken').and.be.exactly(reply);
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

  it('Token re-save should not generate a new publicToken', function(done) {
    token.save(function(err, reply) {
      token.publicToken.should.be.exactly(reply);
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
    Token.findAndValidate(token.publicToken, function(err, reply) {
      should.not.exist(err);
      should.exist(reply);
      done();
    });
  });

  it('Should find the token and and fail the validation', function(done) {
    Token.findAndValidate(token.publicToken, function(err, reply) {
      should.not.exist(err);
      should.exist(reply);
      reply.should.have.property('error');
      done();
    },
    false,
    function(token) { return false; });
  });

  it('Should find the token and pass the validation', function(done) {
    Token.findAndValidate(token.publicToken, function(err, reply) {
      should.not.exist(err);
      should.exist(reply);
      reply.should.have.property('publicToken').be.exactly(token.publicToken);
      done();
    },
    false,
    function(token, decoded) {
      return (token.id === 'token001' && token.id === decoded.id);
    });
  });
});
