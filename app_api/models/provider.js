'use strict';

var mongoose = require('../../config/mongoose');

/* TODO: REDIS!*/
var ratingSchema = new mongoose.Schema({
  _id:        {type: String, required: true},
  rating:     {type: Number, required: true, min: 1, max: 5}
});

var commentSchema = new mongoose.Schema({
  userId:     {type: String, required: true},
  userName:   {type: String, required: true},
  comment:    {type: String, required: true},
  createdAt:  {type: Date, default: Date.now}
});

var locationSchema = new mongoose.Schema({
  name:     String,
  address:  {type: String, required: true},
  coords:   {type: [Number], index: '2dsphere'}
});

var providerSchema = new mongoose.Schema({
  // main properties
  name:         {type: String, require: true},
  description:  {type: String, require: true},
  avatar:       String,

  // query properties
  category:     Array,
  tags:         Array,

  // aditional info
  email:  String,
  phone:  String,
  url:    String,

  //
  locations:  [locationSchema],
  comments:   [commentSchema],
  rating:     {type: Number},
  ratings:    [ratingSchema]
});

// Hooks
providerSchema.pre('save', function(next) {
  var n = 0;
  if(this.ratings.length) {
    for(var i=0, l=this.ratings.length; i<l; i++) n += this.ratings[i].rating;
    if(n !== 0) this.rating = Math.round(n / l);
  }
  next();
});

module.exports = mongoose.model('Provider', providerSchema);
