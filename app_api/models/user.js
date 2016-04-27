'use strict';

const mongo = require('../../config/mongo');
const Token = require('./token');
const bcrypt = require('bcrypt');

const MODEL = 'User';
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
userSchema.methods.saveAndUpdate = function() {
  return new Promise((resolve, reject) => {
    this
      .save()
      .then(usr => {
        Token
          .updateSet(MODEL, this._id, this)
          .then(arr => resolve({user: usr, tokens: arr}))
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
    //
    _id: this._id,
    emails: this.emails,
    accounts: this.accounts,

    // account properties
    isAdmin: this.admin,
    active: this.active,
    createdAt: this.createdAt,
    roles: this.roles,

    // user properties
    fullName: this.fullName
  };

  // Auth mehotds
  publicUser.local = !!this.local.email;
  publicUser.facebook = !!this.facebook.id;
  publicUser.twitter = !!this.twitter.id;
  publicUser.google = !!this.google.id;

  return publicUser;
};

module.exports = mongo.model('User', userSchema);
