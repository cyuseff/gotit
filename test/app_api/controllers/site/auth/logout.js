'use strict';

const request = require('supertest');
const app = require('../../../../../app');
const agent = request.agent(app);
const expect = require('chai').expect;
const Token = require('../../../../../app_api/models/token');
const redis = require('../../../../../config/redis');
const N = 100;

let arr = [];
let ss = [];
let token;
let jwt;
let multi;

describe('Logout controller', () => {

  before((done) => {
    token = new Token({
      model: 'User',
      data: {firstName: 'Test', lastName: 'User'},
      owner: '123123'
    });

    token
      .save()
      .then((obj) => {
        jwt = obj.jwt;

        for(let i=0; i < N; i++) {
          arr.push(`Tokens::User::batch-${i}`);
          arr.push(`content ${i}`);
          ss.push(`Tokens::User::batch-${i}`);
        }

        multi = redis.multi();
        multi
          .MSET(arr)
          .SADD('Tokens::User::123123', ss)
          .exec((err, reply) => {
            if(err) return done(err);
            done();
          });
      })
      .catch(err => done(err));
  });

  it('Return a 204 logout user', (done) => {
    agent
      .get('/api/v1/auth/logout')
      .set('x-access-token', jwt)
      .expect(204, done);
  });

  it('Return a 204 logout all users', (done) => {
    token = new Token({
      model: 'User',
      data: {firstName: 'Test', lastName: 'User'},
      owner: '123123'
    });

    token
      .save()
      .then((obj) => {
        agent
          .get('/api/v1/auth/logout-all')
          .set('x-access-token', obj.jwt)
          .expect(204, done);
      })
      .catch(err => done(err));
  });
});
