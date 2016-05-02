'use strict';

const request = require('supertest');
const app = require('../../../../app');
const agent = request.agent(app);
const expect = require('chai').expect;
const User = require('../../../../app_api/models/user');
const URL = '/api/v1/admin/users';

const users = [
  {fullName: 'U001', emails: ['test@email.com']},
  {fullName: 'U002', emails: ['test@email.com']},
  {fullName: 'U003', emails: ['test@email.com']}
];
let user;
let jwt;

describe('User Admin Controller', () => {

  before((done) => {
    user = new User({firstName: 'Test', lastName: 'User'});
    user
      .create()
      .then(obj => {
        jwt = obj.jwt;
        User.collection.insert(users, {}, (err, reply) => done());
      })
      .catch(err => console.log(err));
  });

  after((done) => {
    user
      .removeAndUpdate()
      .then(() => {
        User.collection.remove({emails: {$in: ['test@email.com']}}, (err, reply) => done());
      })
      .catch(err => console.log(err));
  });

  it('Should return a list of Users', (done) => {
    agent
      .get(URL)
      .set('x-access-token', jwt)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.users).to.have.length.above(2);
      })
      .end(done);
  });
});
