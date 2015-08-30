'use strict';
/*jshint expr: true*/

var dirName = __dirname.substr(0, __dirname.indexOf('/test'));

var should = require('should')
  , app = require(dirName + '/app')
  , Provider = require(dirName + '/app_api/models/provider')
  , provider;

describe('Provider Model', function() {

  after(function(done) {
    provider.remove(done);
  });

  it('Should create a new Provider', function(done) {
    provider = new Provider({
      name: 'Provider 001',
      description:  'My cool test provider'
    });
    should.exist(provider);
    done();
  });

  it('Should save the provider into the DB', function(done) {
    provider.save(function(err) {
      should.not.exist(err);
      Provider.findById(provider._id, function(err, saved) {
        should.not.exist(err);
        saved.should.have.property('_id', provider._id);
        done();
      });
    });
  });

  it('Should fail to add a Location to the Provider', function(done) {
    provider.locations.push({name: 'Loc001'});
    provider.save(function(err, saved) {
      should.exist(err);
      provider.locations = [];
      done();
    });
  });

  it('Should add a Location to Provider', function(done) {
    provider.locations.push({
      name: 'Loc001',
      address: 'Av. SiempreViva 123',
      coords: [0,0]
    });
    provider.save(function(err, saved) {
      should.not.exist(err);
      saved.locations.should.have.lengthOf(1);
      done();
    });
  });

  it('Should add a rating to Provider', function(done) {
    provider.ratings.push({_id: '123', rating: 5});
    provider.save(function(err, saved) {
      try {
        should.not.exist(err);
        saved.ratings.should.have.lengthOf(1);
        saved.rating.should.be.exactly(5);
        done();
      } catch (err) { done(err); }
    });
  });

  it('Should fail to add a rating from the same User', function(done) {
    provider.ratings.push({_id: '123', rating: 1});
    provider.save(function(err, saved) {
      console.log(saved);
      try {
        should.exist(err);
        saved.ratings.should.have.lengthOf(1);
        saved.rating.should.be.exactly(5);
        done();
      } catch (err) { done(err); }
    });
  });

  it('Should recalculate the rating', function(done) {
    provider.ratings.push({_id: '321', rating: 1});
    provider.save(function(err, saved) {
      try {
        should.not.exist(err);
        saved.rating.should.be.exactly(3);
        done();
      } catch (err) { done(err); }
    });
  });

});
