'use strict';
/*jshint expr: true*/

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var should = require('should')
  , app = require(dirName + '/app')
  , User = require(dirName + '/app_api/models/user')
  , Token = require(dirName + '/app_api/models/token')
  , password = '123456'
  , user
  , pUser
  , token;

describe('User Model', function() {
  it('Should create a new User', function(done) {
    user = new User();
    should.exist(user);
    done();
  });

  it('Should generate an encripted password', function(done) {
    user.generateHash(password, function(err, hash) {
      user.local.password = hash;
      should.not.exist(err);
      should.exist(hash);
      done();
    });
  });

  it('Should successfully compare Passwords', function(done) {
    user.comparePassword(password, function(err, isMatch) {
      should.not.exist(err);
      should(isMatch).be.exactly(true);
      done();
    });
  });

  it('Mismatch Passwords', function(done) {
    user.comparePassword('wrong_password', function(err, isMatch) {
      should.not.exist(err);
      should(isMatch).be.exactly(false);
      done();
    });
  });

  it('Should return a public version of the User', function(done) {
    pUser = user.getPublicUser();
    should.exist(pUser);
    pUser.should.have.property('_id');
    done();
  });

  it('Should save the user into the DB', function(done) {
    user.saveAndUpdate(function(err, saved) {
      should.not.exist(err);
      User.findById(pUser._id, function(err, dUser) {
        should.not.exist(err);
        should.exist(dUser);
        done();
      });
    });
  });

  it('Should update User tokens on save (post save Hook)', function(done) {
    // create a user token
    token = new Token({
      set: 'user',
      sid: user._id,
      data: user
    });
    token.save(function(err, jwToken) {
      should.not.exist(err);
      // update a user property
      user.sex = 'male';
      user.saveAndUpdate(function(err, updated) {
        should.not.exist(err);
        updated.sex.should.be.exactly('male');

        // find the token and check sex property
        Token.findByJwt(jwToken, function(err, updatedToken) {
          should.not.exist(err);
          updatedToken.data.should.have.property('sex', 'male');
          done();
        });
      });
    });
  });

  it('Should remove the user from the DB', function(done) {
    user.remove(function(err) {
      should.not.exist(err);
      User.findById(pUser._id, function(err, dUser) {
        should.not.exist(err);
        should.not.exist(dUser);
        done();
      });
    });
  });

  it('User Token should not exist (pre remove hook)', function(done) {
    Token.findByJwt(token.jwToken, function(err, removedToken) {
      should.not.exist(removedToken);
      err.should.have.property('status', 404);
      done();
    });
  });
});
