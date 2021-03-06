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

/*
  Rol Model:
    -id:            (uuid)    autogenerated if not provided
    -name:          (string)  required.
    -accessLevel:   (int)     used to filter the data in a endpoint. 0 is the highest access level.

    -routes:        (array <Object>) Ex:
                      -url: (string) Ex: '/provider/:scope/some-nested-route'
                      -methods: (string, array) Support for "*", "GET", "POST", "PUT" and "DELETE".
                      -recursive: (boolean). Default false. If true, allow user any route under.
                      -accessLevel: (string) Local accessLevel. Default: Rol accessLevel.
*/
function Rol(opts) {
  this.id = opts.id || uuid.v1();
  this.name = opts.name;
  this.accessLevel = opts.accessLevel || null;
  this.routes = opts.routes || [];
}


// Static Methods
Rol.findOneById = function(id, callback) {
  var key = generateRedisKey(id);

  redis.GET(key, function(err, rol) {
    if(err) return callback(err);
    if(!rol) return callback(null, null);
    return callback(null, new Rol(JSON.parse(rol)));
  });
};

// ids = [];
Rol.findByIds = function(ids, callback) {
  var keys = []
    , roles = [];

  for(var i=0, l=ids.length; i<l; i++) keys.push(generateRedisKey(ids[i]));

  redis.MGET(keys, function(err, reply) {
    if(err) return callback(err);
    // convert to objects
    for(i=0, l=reply.length; i<l; i++) {
      if(reply[i] !== null) {
        roles.push(JSON.parse(reply[i]));
      } else {
        roles.push(null);
      }
    }
    return callback(null, roles);
  });
};

Rol.findAll = function(callback) {
  var setKey = generateRedisKey(SET_PREFIX)
    , roles = []
    , script;

  script = 'local keys = redis.call("SMEMBERS", KEYS[1]) if table.getn(keys)==0 then return {} else return redis.call("MGET", unpack(keys)) end';

  redis.EVAL(script, 1, setKey, function(err, reply) {
    if(err) return callback(err);
    for(var i=0, l=reply.length; i<l; i++) roles.push(JSON.parse(reply[i]));
    return callback(null, roles);
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
      if(!reply[0]) return callback({error: 'Rol not found', status: 403});
      return callback(null, {message: 'Rol revoked'});
    });
};


// Instance Methods
Rol.prototype.addRoute = function(url, methods, recursive, accessLevel) {
  accessLevel = accessLevel || this.accessLevel;
  recursive = recursive === true;

  if(url && methods) {
    this.routes.push({
      url: url,
      methods: methods,
      recursive: recursive,
      accessLevel: accessLevel
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
