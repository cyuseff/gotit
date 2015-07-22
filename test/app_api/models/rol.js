'use strict';

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var expect = require('chai').expect
  , app = require(dirName + '/app')
  , Rol = require(dirName + '/app_api/models/rol')
  , rol
  , rol2
  , allRoles;

describe('Rol', function() {
  before(function(done) {
    rol2 = new Rol({name: 'Rol2 Test', accessLevel: 1});
    rol2.save(function(err, reply) {
      done();
    });
  });

  it('Should create a new Rol', function(done) {
    rol = new Rol({name: 'Rol Test', accessLevel: 1});
    expect(rol).to.exist;
    expect(rol).have.property('name', 'Rol Test');
    expect(rol).have.property('accessLevel', 1);
    expect(rol).have.property('id');
    expect(rol).have.property('routes').to.have.length(0);
    done();
  });

  it('Should add a route to Rol', function(done) {
    rol.addRoute('/url', 'GET');
    expect(rol.routes).to.have.length(1);
    done();
  });

  it('Should save rol into the DB', function(done) {
    rol.save(function(err, reply) {
      expect(err).to.not.exist;
      expect(reply).to.include('OK');
      done();
    });
  });

  it('Should find the rol and return it', function(done) {
    Rol.findOneById(rol.id, function(err, dbRol) {
      expect(err).to.not.exist;
      expect(dbRol).to.be.eql(rol);
      done();
    });
  });

  it('Should return a list of specific roles', function(done) {
    Rol.findByIds([rol.id, rol2.id], function(err, roles) {
      expect(err).to.not.exist;
      expect(roles).to.have.length(2);
      expect(roles).to.have.deep.property('[0].id', rol.id);
      expect(roles).to.have.deep.property('[1].id', rol2.id);
      done();
    });
  });

  it('Should return all roles', function(done) {
    Rol.findAll(function(err, roles) {
      allRoles = roles;
      expect(err).to.not.exist;
      expect(roles).to.have.length.of.at.least(2);
      done();
    });
  });

  it('Should remove a rol', function(done) {
    Rol.remove(rol.id, function(err, reply) {
      expect(err).to.not.exist;
      expect(reply).to.have.property('message').to.match(/rol\srevoked/i);
      Rol.findAll(function(err, roles) {
        expect(roles).to.have.length(allRoles.length - 1);
        done();
      });
    });
  });

  it('Should fail to remove an inexistence rol', function(done) {
    Rol.remove(rol.id, function(err, reply) {
      expect(err).to.not.exist;
      expect(reply).to.have.property('error').to.match(/rol\snot\sfound/i);
      done();
    });
  });

});
