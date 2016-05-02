'use strict';

const redis = require('../../config/redis');
const crypto = require('crypto');
const JWT = require('jsonwebtoken');

const NAME_SPACE = 'Tokens'
const SECRET = 'my-cool-secret';
const TOKEN_LENGTH = 32;
const TTL = 0;
/*
  Token Model:
    id:             (string)
    model:          (string, required)
    owner:          (string) owner of the token
    data:           (object, required)

    jwToken:        (string) public jwt generated after save. You should return this to end user.
    ttl:            (int) default 0.
*/
class Token {
  constructor(opts) {
    if(!opts || !opts.model || !opts.data) throw Error('Missing params model || data');

    Object.defineProperty(this, 'model', {
      enumerable: true,
      writable: false,
      value: opts.model
    });

    this.id = null;
    //this.model = opts.model;
    this.owner = opts.owner || null;
    this.data = JSON.stringify(opts.data);

    this.jwt = null;
    this.ttl = opts.ttl || TTL;
    this.createdAt = new Date();
  }

  save() {
    let itemKey;
    let setKey;
    let _save

    _save = (resolve, reject) => {
      let multi = redis.multi();

      if(this.ttl) {
        multi.SETEX(itemKey, this.ttl, JSON.stringify(this));
      } else {
        multi.SET(itemKey, JSON.stringify(this));
      }
      if(setKey) multi.SADD(setKey, itemKey);

      multi.exec((err, reply) => {
        if(err) return reject(err);
        return resolve(this.jwt);
      });

    };

    return new Promise((resolve, reject) => {
      if(!this.id) {
        generateBuffer((err, buff) => {
          if(err) return reject(err);

          Object.defineProperty(this, 'id', {
            enumerable: true,
            writable: false,
            value: buff
          });

          // Generate public token
          this.jwt = generateToken({
            id: buff,
            model: this.model,
            owner: this.owner
          });

          itemKey = generateRedisKey(this.model, this.id);
          if(this.owner) setKey = generateRedisKey(this.model, this.owner);

          _save(resolve, reject);
        });
      } else {
        itemKey = generateRedisKey(this.model, this.id);
        if(this.owner) setKey = generateRedisKey(this.model, this.owner);
        _save(resolve, reject);
      }
    });
  }

  // Static Methods
  static findByJwt(jwt, touch, verify) {
    touch = touch || false;
    let itemKey;
    let setKey;
    let _find;

    _find = (resolve, reject, decoded) => {
      let script = '\
      local token = redis.call("GET", KEYS[1]) \
      if token then \
        if KEYS[3] == "true" then \
          local json = cjson.decode(token) \
          if json.ttl then \
            redis.call("EXPIRE", KEYS[1], json.ttl) \
          end \
        end \
        return token \
      else \
        redis.call("SREM", KEYS[2], KEYS[1]) \
        return nil \
      end';

      redis.EVAL(script, 3, itemKey, setKey, touch, (err, token) => {
        if(err) return reject(err);
        if(!token) return reject(new Error('Not found.'));

        token = JSON.parse(token);

        if(verify) {
          if(verify(token, decoded)) {
            resolve(token);
          } else {
            reject(new Error('Bad token.'));
          }
        } else {
          resolve(token);
        }
      });
    };

    return new Promise((resolve, reject) => {
      JWT.verify(jwt, SECRET, (err, decoded) => {
        if(err) return reject(err);
        itemKey = generateRedisKey(decoded.model, decoded.id);
        setKey = (decoded.owner)? generateRedisKey(decoded.model, decoded.owner) : '';

        _find(resolve, reject, decoded);
      });
    });
  }

  static removeByJwt(jwt) {
    let itemKey;
    let setKey;
    let _remove;

    _remove = (resolve, reject, decoded) => {
      let multi = redis.multi();
      multi.DEL(itemKey);
      if(setKey) multi.SREM(setKey, itemKey);

      multi.exec((err, reply) => {
        if(err) return reject(err);
        return resolve(reply);
      });
    };

    return new Promise((resolve, reject) => {
      JWT.verify(jwt, SECRET, (err, decoded) => {
        if(err) return reject(err);
        itemKey = generateRedisKey(decoded.model, decoded.id);
        setKey = (decoded.owner)? generateRedisKey(decoded.model, decoded.owner) : '';

        _remove(resolve, reject, decoded);
      });
    });
  }

  static findSet(model, owner) {
    const setKey = generateRedisKey(model, owner);
    const script = 'local keys = redis.call("SMEMBERS", KEYS[1]) if table.getn(keys)==0 then return {} else return redis.call("MGET", unpack(keys)) end';

    return new Promise((resolve, reject) => {
      redis.EVAL(script, 1, setKey, (err, reply) => {
        if(err) return reject(err);
        resolve(reply.map(t => JSON.parse(t)));
      });
    });
  }

  static updateSet(model, owner, data) {
    data = JSON.stringify(data);
    const setKey = generateRedisKey(model, owner);
    const script = '\
      local json \
      local ttl \
      local keys = redis.call("SMEMBERS", KEYS[1]) \
      local data = cjson.decode(ARGV[1]) \
      if table.getn(keys) == 0 then return keys end \
      for i, k in ipairs(keys) do \
        ttl = redis.call("TTL", k) \
        if ttl == -2 or ttl == 0 then \
          redis.call("SREM", KEYS[1], k) \
        elseif ttl == -1 then \
          json = cjson.decode(redis.call("GET", k)) \
          json.data = data \
          redis.call("SET", k, cjson.encode(json)) \
        else \
          json = cjson.decode(redis.call("GET", k)) \
          json.data = data \
          redis.call("SETEX", k, ttl, cjson.encode(json)) \
        end \
      end \
      return redis.call("SMEMBERS", KEYS[1])';

    return new Promise((resolve, reject) => {
      redis.EVAL(script, 1, setKey, data, (err, reply) => {
        if(err) return reject(err);
        resolve(reply);
      });
    });
  }

  static removeSet(model, owner) {
    const setKey = generateRedisKey(model, owner);
    const script = 'local keys = redis.call("SMEMBERS", KEYS[1]) if table.getn(keys)==0 then return nil else table.insert(keys, KEYS[1]) return redis.call("DEL", unpack(keys)) end';

    return new Promise((resolve, reject) => {
      redis.EVAL(script, 1, setKey, function(err, reply) {
        if(err) return reject(err);
        if(!reply) return reject(new Error('Set not found.'));
        resolve(reply);
      });
    });
  }
}

function generateBuffer(callback) {
  crypto.randomBytes(TOKEN_LENGTH, function(err, buf) {
    if(err) return callback(err);
    callback(null, buf.toString('hex'));
  });
}

function generateToken(data) {
  data.createdAt = Date.now();
  return JWT.sign(data, SECRET, {});
}

function generateRedisKey(model, buff) {
  return `${NAME_SPACE}::${model}::${buff}`;
}

module.exports = Token;
