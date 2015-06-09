"use strict";

var mongoose = require('mongoose')
  , bcrypt = require('bcrypt')
  , jwt = require('jsonwebtoken')
  , SALT_WORK_FACTOR = 2 // 8 => 12, been 12 the recommended factor
  , SECRET = 'my-cool-secret';


var userSchema = mongoose.Schema({

  token:      { type: String, unique: true },

  email:      { type: String }, // primary email, indexed
  emails:     Array,            // all accounts emails
  accounts:   Array,            // merged accounts ids

  //account properties
  admin:      { type: Boolean, default: false },
  active:     { type: Boolean, default: true },
  createdAt:  { type: String, default: Date.now },

  //user properties
  fullName:   String,
  firstName:  String,
  lastName:   String,
  birthAt:    String,
  sex:        String,
  phone:      Number,

  //additional info
  address:    String,
  commune:    String,
  city:       String,

  //authenticated with
  local: {
    email:        String,
    password:     String
  },

  facebook: {
    id:           String,
    token:        String,
    email:        String,
    name:         String
  },

  twitter: {
    id:           String,
    token:        String,
    displayName:  String,
    username:     String
  },

  google: {
    id:           String,
    token:        String,
    email:        String,
    name:         String
  }

});

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

userSchema.methods.getPublicUser = function(){
  var publicUser = {
    //
    _id: this._id,
    email: this.email,
    accounts: this.accounts,

    //account properties
    isAdmin: this.admin,
    active: this.active,
    createdAt: this.createdAt,

    //user properties
    fullName: this.fullName
  };

  //add auth
  if(this.local.email) publicUser.local = this.local.email;
  if(this.facebook.id) publicUser.facebook = this.facebook.id;
  if(this.twitter.id) publicUser.twitter = this.twitter.id;
  if(this.google.id) publicUser.google = this.google.id;

  return publicUser;
};

userSchema.methods.generateToken = function(callback) {
  this.token = jwt.sign(this.getPublicUser(), SECRET, {});
  callback(this.token);
};

module.exports = mongoose.model('User', userSchema);
