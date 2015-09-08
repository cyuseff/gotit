'use strict';
/*jshint expr: true*/

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var should = require('should')
  , app = require(dirName + '/app')
  , Rol = require(dirName + '/app_api/models/rol')
  , rol
  , rol2
  , allRoles;

describe('Rol Model', function() {
  before(function(done) {
    rol2 = new Rol({name: 'Rol2 Test'});
    rol2.save(done);
  });

  after(function(done) {
    Rol.remove(rol2.id, done);
  });

  it('Should create a new Rol', function(done) {
    rol = new Rol({name: 'Rol Test', accessLevel: 1});
    should.exist(rol);
    rol.should.have.properties({name: 'Rol Test', accessLevel: 1});
    rol.should.have.property('id');
    rol.should.have.property('routes').with.lengthOf(0);
    done();
  });

  it('Should add a route to Rol', function(done) {
    rol.addRoute('/url', 'GET');
    rol.should.have.property('routes').with.lengthOf(1);
    done();
  });

  it('Should save rol into the DB', function(done) {
    rol.save(function(err, reply) {
      should.not.exist(err);
      reply.should.containEql('key');
      done();
    });
  });

  it('Should find the rol and return it', function(done) {
    Rol.findOneById(rol.id, function(err, dbRol) {
      should.not.exist(err);
      dbRol.should.be.eql(rol);
      done();
    });
  });

  it('Should return a list of specific roles', function(done) {
    Rol.findByIds([rol.id, rol2.id], function(err, roles) {
      should.not.exist(err);
      roles.should.have.a.lengthOf(2);
      roles.should.containDeepOrdered([{id: rol.id}, {id: rol2.id}]);
      done();
    });
  });

  it('Should return all roles', function(done) {
    Rol.findAll(function(err, roles) {
      allRoles = roles;
      should.not.exist(err);
      roles.length.should.be.above(2);
      done();
    });
  });

  it('Should remove a rol', function(done) {
    Rol.remove(rol.id, function(err, reply) {
      should.not.exist(err);
      reply.should.have.property('message').which.match(/rol\srevoked/i);
      done();
    });
  });

  it('Should not find the removed rol (Rol.findOneById method)', function(done) {
    Rol.findOneById(rol.id, function(err, rRol) {
      should.not.exist(err);
      should.not.exist(rRol);
      done();
    });
  });

  it('Should not find the removed rol (Rol.findByIds method)', function(done) {
    Rol.findByIds([rol.id], function(err, roles) {
      should.not.exist(err);
      should(roles[0]).be.exactly(null);
      done();
    });
  });

  it('Should fail to remove an inexistence rol', function(done) {
    Rol.remove(rol.id, function(err, reply) {
      should.exist(err);
      should.not.exist(reply);
      err.should.have.properties('error', 'status');
      done();
    });
  });

});
