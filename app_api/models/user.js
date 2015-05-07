"use strict";

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
	name: {type:String, required:true, unique: true},
  email: {type:String, required:true, unique: true},
  password: {type:String, required: true}
});

mongoose.model('User', userSchema);
