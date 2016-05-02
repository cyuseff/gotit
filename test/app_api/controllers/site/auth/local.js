'use strict';

const request = require('supertest');
const app = require('../../../../../app');
const agent = request.agent(app);
const expect = require('chai').expect;
const User = require('../../../../../app_api/models/user')
const URL = '/api/v1/auth/local';

let email = 'test@email.com';
let password = '123abC';
let id;
let token;

describe('Auth local controller', () => {
  after((done) => {
    User
      .findById(id)
      .exec((err, usr) => {
        if(err) return done(err);

        usr
          .removeAndUpdate()
          .then(() => done())
          .catch(err => done(err));
      });
  });

  describe('Signin', () => {
    it('Return a 400 error required fields', (done) => {
      agent
        .post(URL)
        .send(`email=${email}`)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(/Password and email required/, done);
    });

    it('Return a 400 error invalid Email', (done) => {
      agent
        .post(URL)
        .send(`email=wrong&password=${password}`)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(/Invalid email address/, done);
    });

    it('Return a 400 error password characters error', (done) => {
      agent
        .post(URL)
        .send(`email=${email}&password=aé`)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(/Password can only have alpha numerical characters/, done);
    });

    it('Return a 400 error password length error', (done) => {
      agent
        .post(URL)
        .send(`email=${email}&password=1234&confirm_password=1234`)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(/Password must have at least 6 characthers length/, done);
    });

    it('Return a 400 error password do not match', (done) => {
      agent
        .post(URL)
        .send(`email=${email}&password=${password}&confirm_password=1234`)
        .expect(400)
        .expect('Content-Type', /json/)
        .expect(/Passwords do not match/, done);
    });

    it('Return 201 with a new User', (done) => {
      agent
        .post(URL)
        .send(`email=${email}&password=${password}&confirm_password=${password}&first_name=User&last_name=Test`)
        .expect(201)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body.token).to.exist;
          expect(res.body.id).to.exist;
          token = res.body.token;
          id = res.body.id;
        })
        .end(done);
    });

    it('Return 409 error email exist', (done) => {
      agent
        .post(URL)
        .send(`email=${email}&password=${password}&confirm_password=${password}&first_name=User&last_name=Test`)
        .expect(409)
        .expect('Content-Type', /json/)
        .expect(/This email is already in use/, done);
    });
  });
});
