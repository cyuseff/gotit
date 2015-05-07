"use strict";

var request = require('supertest'),
  app = require('../app'),
  mongoose = require('mongoose');

var User = mongoose.model('User');

describe('Request to the root path', function(){

  it('Return a 200 status code', function(done) {

    request(app)
      .get('/')
      .expect(200, done);

  });

});




describe('Create a new User', function(){

  it('Returns a 201 and _id:name:email', function(done){
		request(app)
			.post('/api/users')
			.send('name=User001&email=user001@mail.com&password=1234')
			.expect(201)
      .expect(/User001/)
      .expect(/user001\@mail.com/)
      .expect(/_id/, done);
	});

  it('do not return user passwords', function(done){
		request(app)
			.post('/api/users')
			.send('name=User002&email=user002@mail.com&password=1234')
      .expect(function(res){
        //to pass test return falsy value
        return /password/.test(JSON.stringify(res.body));
      })
      .end(done);
	});

  it('Validate uniqueness of user name', function(done){
		request(app)
			.post('/api/users')
			.send('name=User002&email=user003@mail.com&password=1234')
			.expect(400, done);
	});

  it('Validate uniqueness of user email', function(done){
		request(app)
			.post('/api/users')
			.send('name=User003&email=user002@mail.com&password=1234')
			.expect(400, done);
	});

	it('Validate required (user, email and password)', function(done){
		request(app)
      .post('/api/users')
			.send('name=&email=&password=')
			.expect(400, done);
	});


});




describe('List of Users', function(){

  it('Return a 200, Json format', function(done) {

    request(app)
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /json/, done);

  });


  it('Return Test Users (Users001 & Users002)', function(done){
		request(app)
			.get('/api/users')
			.expect(/User001[^U]*User002/, done);
	});


  it('do not return user passwords', function(done){
    request(app)
      .get('/api/users')
      .expect(function(res){
        //to pass test return falsy value
        return /password/.test(JSON.stringify(res.body));
      })
      .end(done);
  });

  after(function(done){

    var n = 0;
    function cb(err) {
      if(err) {
        console.log(err);
        return;
      }
      n++;
      if(n === 2) done();
    }

    User
      .findOneAndRemove({name:'User001'})
      .exec(function(err, user){
        cb(err);
      });

    User
      .findOneAndRemove({name:'User002'})
      .exec(function(err, user){
        cb(err);
      });

  });

});



var dummy;
describe('Show one User', function(){

  before(function(done){
    User.create({
  		name: 'Dummy',
  	  email: 'dummy@email.com',
  	  password: 'dummy123',
  	}, function(err, user) {
  		if (err) console.log(err);
      dummy = user;
      done();
  	});
  });

  it('Return a 200, Json format', function(done) {

    request(app)
      .get('/api/users/'+dummy._id)
      .expect(200)
      .expect('Content-Type', /json/, done);

  });


  it('Return Dummy Users', function(done){
		request(app)
			.get('/api/users/'+dummy._id)
			.expect(/Dummy/i, done);
	});


  it('do not return user passwords', function(done){
    request(app)
    .get('/api/users/'+dummy._id)
      .expect(function(res){
        //to pass test return falsy value
        return /password/i.test(JSON.stringify(res.body));
      })
      .end(done);
  });

});





describe('Update a User', function(){

  it('Update Dummy user email', function(done) {

    request(app)
      .put('/api/users/'+dummy._id)
      .send('email=new@email.com')
      .expect(200)
      .expect(function(res){
        //to pass test return falsy value
        return /password/.test(res.body);
      })
      .expect(/new\@email.com/, done);

  });

});




describe('Delete a User', function(){

  it('Returns a 204 status code', function(done){
		request(app)
      .delete('/api/users/'+dummy._id)
			.expect(204)
			.end(function(error){
				if(error) throw error;
				done();
			});
	});

});
