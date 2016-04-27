'use strict';

const mongo = require(`${__base}/config/mongo`);
const bcrypt = require('bcrypt');
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
// Password setter
userSchema.methods.generateHash = function(password, callback) {
  bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
    if(err) return callback(err);
    callback(null, hash);
  });
};


// Password verification
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.local.password, (err, isMatch) => {
    if(err) return callback(err);
    callback(null, isMatch);
  });
};

module.exports = mongo.model('User', userSchema);
