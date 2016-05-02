'use strict';

const expect = require('chai').expect;
const Token = require('../../../app_api/models/token');
const redis = require('../../../config/redis');

const opts = {
  model: 'Test-Static',
  owner: 123,
  data: {foo:'var'}
};
let token;

const ttlOpts = {
  model: 'Test-Expirable',
  owner: 456,
  ttl: 120,
  data: {exp: true}
};
let ttlToken;
let removeToken;

describe('Token Model', () => {

  after((done) => {
    Token
      .removeSet(ttlToken.model, ttlToken.owner)
      .then(() => done())
      .catch(err => done(err));
  });

  it('Should create a new Token', () => {
    token = new Token(opts);
    expect(token).to.exist;
  });

  it('Should save Token into the DB', (done) => {
    token
      .save()
      .then((jwt) => {
        expect(jwt).to.exist;
        expect(token).to.have.property('jwt', jwt);
        return done();
      })
      .catch((err) => done(err));
  });

  it('Token re-save should not generate a new jwToken', (done) => {
    let old = token.jwt;
    token
      .save()
      .then((jwt) => {
        expect(jwt).to.equal(old);
        return done();
      })
      .catch(err => done(err));
  });

  it('Should create a Expirable Token', (done) => {
    ttlToken = new Token(ttlOpts);
    ttlToken
      .save()
      .then(() => {
        expect(ttlToken).to.have.property('ttl', ttlOpts.ttl);
        redis.TTL(`Tokens::${ttlToken.model}::${ttlToken.id}`, (err, reply) => {
          if(err) return done(err);
          expect(reply).to.be.closeTo(ttlOpts.ttl, 1);
          done();
        });
      })
      .catch(err => done(err));
  });

  it('Should find the token and return it', (done) => {
    Token
      .findByJwt(token.jwt)
      .then((tk) => {
        expect(tk).to.exist;
        expect(tk).to.have.property('id', token.id);
        return done();
      })
      .catch(err => done(err));
  });

  it('Should return an error with a invalid token', (done) => {
    Token
      .findByJwt('dummy')
      .then(() => done(new Error('Token Should not exist.')))
      .catch((err) => {
        expect(err).to.exist;
        expect(err.toString()).to.contain('JsonWebTokenError');
        return done();
      });
  });

  it('Should find the token and and fail the validation', (done) => {
    Token
      .findByJwt(token.jwt, false, () => false)
      .then(() => done(new Error('Token Should not exist.')))
      .catch((err) => {
        expect(err).to.exist;
        expect(err.toString()).to.contain('Bad token.');
        return done();
      });
  });

  it('Should find the token and pass the validation', (done) => {
    Token
      .findByJwt(token.jwt, false, (tt, dd) => {
        return tt.id === dd.id;
      })
      .then((tk) => {
        expect(tk).to.exist;
        expect(tk).to.have.property('id', token.id);
        return done();
      })
      .catch(err => done(err));
  });

  it('Should find a expirable token and update his TTL', (done) => {
    redis.EXPIRE(`Tokens::${ttlToken.model}::${ttlToken.id}`, 30, (err, reply) => {
      if(err) return done(err);
      expect(reply).to.equal(1);

      Token
        .findByJwt(ttlToken.jwt, true)
        .then(tk => {
          expect(tk).to.exist;

          redis.TTL(`Tokens::${ttlToken.model}::${ttlToken.id}`, (err, rep) => {
            if(err) return done(err);
            expect(rep).to.be.closeTo(ttlOpts.ttl, 1);
            done();
          });

        })
        .catch(err => done(err));

    });
  });

  it('Should find a expirable token and not update his TTL', (done) => {
    redis.EXPIRE(`Tokens::${ttlToken.model}::${ttlToken.id}`, 30, (err, reply) => {
      if(err) return done(err);
      expect(reply).to.equal(1);

      Token
        .findByJwt(ttlToken.jwt)
        .then(tk => {
          expect(tk).to.exist;

          redis.TTL(`Tokens::${ttlToken.model}::${ttlToken.id}`, (err, rep) => {
            if(err) return done(err);
            expect(rep).to.be.closeTo(30, 1);
            done();
          });

        })
        .catch(err => done(err));

    });
  });

  it('Should remove a token by JWT', (done) => {
    removeToken = new Token(opts);
    removeToken
      .save()
      .then((data) => {
        Token
          .removeByJwt(removeToken.jwt)
          .then((reply) => {
            expect(reply).to.exist;
            expect(reply).to.eql([1,1]);
            done();
          })
          .catch(err => done(err));
      })
      .catch(e => done(e))
  });

  it('Should fail to remove it again', (done) => {
    Token
      .removeByJwt(removeToken.jwt)
      .then((reply) => {
        expect(reply).to.exist;
        expect(reply).to.eql([0,0]);
        done();
      })
      .catch(err => done(err));
  });

  it('Should not found the removed token', (done) => {
    Token
      .findByJwt(removeToken.jwt)
      .then(() => done(new Error('Should fail.')))
      .catch((err) => {
        expect(err).to.exist;
        expect(err.toString()).to.contain('Not found');
        done();
      });
  });

  it('Should return a list of Tokens', (done) => {
    Token.
      findSet(token.model, token.owner)
      .then((set) => {
        expect(set).to.exist;
        expect(set).to.be.instanceof(Array);
        expect(set).to.have.length.above(0);
        done();
      })
      .catch(err => done(err));
  });

  it('Should update all tokens data in Set', (done) => {
    const data = {a: 1, b: 2};
    let json;
    Token
      .updateSet(token.model, token.owner, data)
      .then(set => {
        expect(set).to.have.length.above(0);
        redis.GET(set[set.length - 1], (err, reply) => {
          if(err) done(err);
          expect(reply).to.exist;
          json = JSON.parse(reply);
          expect(json).to.have.property('data').eql(data);
          done();
        });
      })
      .catch(err => done(err));
  });

  it('Should update all TTL tokens and don\'t modify their TTL', (done) => {
    const data = {c: 1, d: 2};
    const key = `Tokens::${ttlToken.model}::${ttlToken.id}`;
    let ttl;
    let json;

    redis.TTL(key, (err, reply) => {
      if(err) done(err);
      ttl = reply;
      expect(ttl).to.be.above(0);

      Token
        .updateSet(ttlToken.model, ttlToken.owner, data)
        .then(set => {
          expect(set).to.have.length.above(0);
          redis.TTL(key, (err, reply) => {
            if(err) done(err);
            expect(reply).to.be.above(0);
            expect(reply).to.be.closeTo(ttl, 1);
            done();
          });
        })
        .catch(err => done(err));
    });
  });

  it('Should remove all token in Set', (done) => {
    Token
      .removeSet(token.model, token.owner)
      .then(reply => {
        expect(reply).to.be.above(0);
        redis.EXISTS(`Tokens::${token.model}::${token.owner}`, (err, reply) => {
          if(err) return done(err);
          expect(reply).to.equal(0);
        });
        done();
      })
      .catch(err => done(err));
  });
});
