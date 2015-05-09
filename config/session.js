"use strict";

var session = require('express-session');

//store session on redis instead server RAM
var RedisStore = require('connect-redis')(session);


//set secret key for session
var SECRET = (process.env.NODE_ENV == 'production')? process.env.NODE_SECRET : 'secret';

//redis opt
var redis_opt = {
  ttl:10,
  prefix:'got-it-sess:'
};


/* REDIS OPTS
client:       An existing client created using redis.createClient()
host:         Redis server hostname
port:         Redis server portno
socket:       Redis server unix_socket
ttl:          Redis session TTL (expiration) in seconds
disableTTL:   disables setting TTL, keys will stay in redis until evicted by other means (overides ttl)
db:           Database index to use
pass:         Password for Redis authentication
prefix:       Key prefix defaulting to "sess:"
unref:        Set true to unref the Redis client. Warning: this is an experimental feature.
*/

//session opt
var session_ops = {
  secret: SECRET,
  name: 'got-it',
  resave: false,
  saveUninitialized:false,
  store: new RedisStore(redis_opt)// if is not specify it will use server ram
};

module.exports = function(app) {
  app.use(session(session_ops));
};
