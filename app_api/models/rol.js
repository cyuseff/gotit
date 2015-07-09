'use strict';

var redis = require('../../config/redis')
  , uuid = require('uuid')
  , NAME_SPACE = 'got-it'
  , PREFIX = 'rol'
  , SET_PREFIX = 'roles';

function generateRedisKey(primaryKey, secondaryKey) {
  var key = NAME_SPACE + ':' + PREFIX + ':' + primaryKey;
  if(secondaryKey) key += ':' + secondaryKey;
  return key;
}

function Rol(id, name, accessLevel) {
  this.id = id;
  this.name = name;
  this.accessLevel = accessLevel || 0;
  this.routes = [];

  // create UUID
  (function(me) {
    if(!me.id) me.id = uuid.v1();
  })(this);
}


// Static Methods
Rol.findOneById = function(id, callback) {
  var key = generateRedisKey(id)
    , data
    , rol;

  redis.GET(key, function(err, reply) {
    if(err) return callback(err);
    if(!reply) return callback(null, null);

    data = JSON.parse(reply);
    rol = new Rol(data.id, data.name, data.accessLevel);
    rol.routes = data.routes;
    return callback(null, rol);
  });
};

Rol.findAll = function(callback) {
  var setKey = generateRedisKey(SET_PREFIX)
    , roles = [];

  redis.SMEMBERS(setKey, function(err, keys) {
    if(err) return callback(err);
    if(!keys.length) return callback(null, roles);

    redis.MGET(keys, function(err, reply) {
      if(err) return callback(err);
      // convert to objects
      for(var i=0, l=reply.length; i<l; i++) roles.push(JSON.parse(reply[i]));
      return callback(null, roles);
    });
  });
};

Rol.remove = function(id, callback) {
  var key = generateRedisKey(id)
    , setKey = generateRedisKey(SET_PREFIX);

  redis.multi()
    .DEL(key)
    .SREM(setKey, key)
    .exec(function(err, reply) {
      if(err) return callback(err);
      console.log(reply);
      if(!reply[1]) return callback(null, {error: 'Rol not found'});
      return callback(null, {message: 'Rol revoked'});
    });
};


// Instance Methods
Rol.prototype.addRoute = function(url, methods, recursive) {
  if(url && methods && recursive) {
    this.routes.push({
      url: url,
      methods: methods,
      recursive: recursive
    });
  }
};

Rol.prototype.save = function(callback) {
  var me = this
    , key = generateRedisKey(me.id)
    , setKey = generateRedisKey(SET_PREFIX);

  redis.multi()
    .SET(key, JSON.stringify(me))
    .SADD(setKey, key)
    .exec(function(err, reply) {
      if(err) return callback(err);
      return callback(null, reply);
    });
};

module.exports = Rol;
