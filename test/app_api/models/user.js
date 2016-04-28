'use strict';

const expect = require('chai').expect;
const User = require('../../../app_api/models/user');
const Token = require('../../../app_api/models/token');
const PASSWORD = '123123';
const opts = {fullName: 'Test User', firstName: 'Test', lastName: 'User'}

let user;
let pUser;
let token;
let JWToken;

describe('User Model', () => {
  it('Should create a new User', () => {
    user = new User(opts);
    expect(user).to.exist;
  });

  it('Should generate an encripted password', (done) => {
    user
      .generateHash(PASSWORD)
      .then(hash => {
        expect(hash).to.exist;
        user.local.password = hash;
        done();
      })
      .catch(err => done(err));
  });

  it('Should successfully compare passwords', (done) => {
    user
      .comparePassword(PASSWORD)
      .then(isMatch => {
        expect(isMatch).to.equal(true);
        done();
      })
      .catch(e => done(e));
  });

  it('Mismatch Passwords', (done) => {
    user
      .comparePassword('wrong_password')
      .then(isMatch => {
        expect(isMatch).to.equal(false);
        done();
      })
      .catch(e => done(e));
  });

  it('Should return a public version of the User', (done) => {
    pUser = user.getPublicUser();
    expect(pUser).to.exist;
    expect(pUser).to.have.property('_id');
    done();
  });

  it('Should save the user into the DB and create a Token', function(done) {
    user
      .create()
      .then((obj) => {
        expect(obj).to.have.deep.property('user._id', user._id);
        expect(obj.jwt).to.exist;
        JWToken = obj.jwt;

        User.findById(pUser._id, function(err, usr) {
          if(err) done(err);
          expect(usr).to.exist;
          Token
            .findByJwt(JWToken)
            .then(token => {
              expect(token).to.exist;
              done();
            })
            .catch(err => done(err))
        });
      })
      .catch(err => done(err));
  });

  it('User.saveAndUpdate should update instance tokens on save', (done) => {
    user.sex = 'male';
    user
      .saveAndUpdate()
      .then(obj => {
        expect(obj.user).to.have.property('sex', 'male');
        Token
          .findByJwt(JWToken)
          .then(uToken => {
            expect(uToken.data).to.have.property('sex', 'male');
            done();
          })
          .catch(err => done(err));
      })
      .catch(err => done(err));
  });

  it('User.delete method should remove the user an his tokens', (done) => {
    user
      .removeAndUpdate()
      .then(msn => {
        expect(msn).to.equal('ok');
        Token
          .findByJwt(JWToken)
          .then(() => done(new Error('Should not exist.')))
          .catch(err => {
            expect(err).to.exist;
            expect(err.toString()).to.contains('Not found');
            done();
          });
      })
      .catch(e => done(e));
  });

});
