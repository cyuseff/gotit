'use strict';

const redis = require('redis');
const client = redis.createClient();

// Conection Events
client.on('error', err => console.log('Redis err:', err));
// client.on('connect', () => console.log('Redis is ready'));

module.exports = client;
