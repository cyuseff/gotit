'use strict';

const mongo = require('../../config/mongo');
const Token = require('./token');
const bcrypt = require('bcrypt');

const MODEL = 'User';
const TTL = 120;
const SALT_ROUNDS = (process.env.NODE_ENV == 'production')? 12 : 2;

const userSchema = new mongo.Schema({
  // user properties
  emails:     Array,
  fullName:   String,
  firstName:  String,
  lastName:   String,
  birthAt:    Date,
  sex:        String,

  // account properties
  admin:      { type: Boolean, default: false },
  roles:      Array,
  createdAt:  { type: Date, default: Date.now },
  active:     { type: Boolean, default: true },
  verify:     { type: Boolean, default: false },

  // additional info
  phone:      String,
  address:    String,
  commune:    String,
  city:       String,

  // authenticated with
  local: {
    email:        { type: String, unique: true, sparse: true },
    password:     String
  },

  facebook: {
    id:           { type: String, unique: true, sparse: true },
    token:        String,
    email:        String,
    name:         String
  },

  twitter: {
    id:           { type: String, unique: true, sparse: true },
    token:        String,
    displayName:  String,
    username:     String
  },

  google: {
    id:           { type: String, unique: true, sparse: true },
    token:        String,
    email:        String,
    name:         String
  }
});

// Hooks

// Methods
userSchema.methods.create = function() {
  let token;
  return new Promise((resolve, reject) => {
    this
      .save()
      .then(() => {
        this
          .createToken()
          .then(obj => resolve({user: obj.data, jwt: obj.jwt}))
          .catch(err => resolve({user: this.getPublicUser(), jwt: null}));
      })
      .catch(err => {
        reject(err)
      });
  });
};

userSchema.methods.createToken = function() {
  let token;
  return new Promise((resolve, reject) => {
    token = new Token({
      model: MODEL,
      owner: this._id,
      data: this.getPublicUser()
    });

    token
      .save()
      .then(obj => resolve(obj))
      .catch(err => reject(err));
  });
};

userSchema.methods.saveAndUpdate = function() {
  return new Promise((resolve, reject) => {
    this
      .save()
      .then(() => {
        Token
          .updateSet(MODEL, this._id, this.getPublicUser())
          .then(arr => resolve({user: this.getPublicUser(), tokens: arr}))
          .catch(err => reject(err));
      })
      .catch(e => reject(err));
  });
};

userSchema.methods.removeAndUpdate = function() {
  return new Promise((resolve, reject) => {
    this
      .remove()
      .then(() => {
        Token
          .removeSet(MODEL, this._id)
          .then(() => resolve('ok'))
          .catch(e => reject(err, {model: MODEL, id: this._id}));
      })
      .catch(err => reject(err));
  });
};

// Password setter
userSchema.methods.generateHash = function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
      if(err) return reject(err);
      resolve(hash);
    });
  });
};


// Password verification
userSchema.methods.comparePassword = function(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.local.password, (err, isMatch) => {
      if(err) return reject(err);
      resolve(isMatch);
    });
  });
};

userSchema.methods.getPublicUser = function() {
  let publicUser = {
    id: this._id,
    emails: this.emails,
    fullName: this.fullName,
    firstName: this.firstName,
    lastName: this.lastName,
    birthAt: this.birthAt,
    sex: this.sex,

    admin: this.admin,
    roles: this.roles,
    createdAt: this.createdAt,
    active: this.active,
    verify: this.verify,

    // additional info
    phone: this.phone,
    address: this.address,
    commune: this.commune,
    city: this.city
  };

  // Auth mehotds
  publicUser.local = !!this.local.email;
  publicUser.facebook = !!this.facebook.id;
  publicUser.twitter = !!this.twitter.id;
  publicUser.google = !!this.google.id;
  
  return publicUser;
};

module.exports = mongo.model('User', userSchema);
