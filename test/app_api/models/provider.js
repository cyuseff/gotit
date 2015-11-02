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
    var rnd = Math.round(Math.random() * 1000);
    provider = new Provider({
      name: 'Provider ' + rnd,
      slug: 'provider-' + rnd,
      description:  'My cool test provider',
      category: ',category,test'
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
});
