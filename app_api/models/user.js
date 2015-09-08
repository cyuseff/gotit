'use strict';

var mongoose = require('../../config/mongoose')
  , Token = require('./token')
  , bcrypt = require('bcrypt')
  , SALT_WORK_FACTOR = 2 // 8 => 12, been 12 the recommended factor
  , SET = 'users';


var userSchema = new mongoose.Schema({

  emails:     Array,            // all accounts emails
  accounts:   Array,            // merged accounts ids

  // account properties
  admin:      { type: Boolean, default: false },
  roles:      Array,
  createdAt:  { type: Date, default: Date.now },
  active:     { type: Boolean, default: true },
  verify:     { type: Boolean, default: false },

  // user properties
  fullName:   String,
  firstName:  String,
  lastName:   String,
  birthAt:    Date,
  sex:        String,
  phone:      Number,

  // additional info
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
userSchema.pre('remove', function(next) {
  Token.removeAllInSetbySid(SET, this._id, function(err, message) {
    if(message.scaned !== message.removed) {
      next(new Error('Not all tokens where removed.'));
    } else {
      next();
    }
  });
});

// Methods
// Save Method
userSchema.methods.saveAndUpdate = function(callback) {
  var me = this;
  me.save(function(err, user) {
    if(err) return callback(err);
    Token.updateAllInSetBySid(SET, me._id, me, function(err, reply) {
      if(err) return callback({error: 'Tokens not updated', code: 400});
      return callback(null, user);
    });
  });
};

// Password setter
userSchema.methods.generateHash = function(password, callback) {
  bcrypt.hash(password, SALT_WORK_FACTOR, function(err, hash) {
    if(err) return callback(err);
    callback(null, hash);
  });
};


// Password verification
userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.local.password, function(err, isMatch) {
    if(err) return callback(err);
    callback(null, isMatch);
  });
};

userSchema.methods.getPublicUser = function() {
  var publicUser = {
    //
    _id: this._id,
    emails: this.emails,
    accounts: this.accounts,

    // account properties
    isAdmin: this.admin,
    active: this.active,
    createdAt: this.createdAt,

    // user properties
    fullName: this.fullName
  };

  // Auth mehotds
  publicUser.local = (this.local.email)? true : false;
  publicUser.facebook = (this.facebook.id)? true : false;
  publicUser.twitter = (this.twitter.id)? true : false;
  publicUser.google = (this.google.id)? true : false;

  return publicUser;
};

module.exports = mongoose.model('User', userSchema);
