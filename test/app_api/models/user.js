'use strict';
/*jshint expr: true*/

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var should = require('should')
  , app = require(dirName + '/app')
  , User = require(dirName + '/app_api/models/user')
  , password = '123456'
  , user
  , pUser;

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

  it('Should return a public version of the User', function(done) {
    pUser = user.getPublicUser();
    should.exist(pUser);
    pUser.should.have.property('_id');
    done();
  });

  it('Should save the user into the DB', function(done) {
    user.save(function(err) {
      should.not.exist(err);
      User.findById(pUser._id, function(err, dUser) {
        should.not.exist(err);
        should.exist(dUser);
        done();
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
});
