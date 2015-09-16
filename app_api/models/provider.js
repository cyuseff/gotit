'use strict';

var mongoose = require('../../config/mongoose');

var locationSchema = new mongoose.Schema({
  name:     String,
  address:  {type: String, required: true},
  coords:   {type: [Number], index: '2dsphere'}
});

var providerSchema = new mongoose.Schema({
  // main properties
  name:         {type: String, required: true},
  slug:         {type: String, required: true, unique: true},
  description:  {type: String, required: true},
  avatar:       String,
  createdAt:    {type: Date, default: Date.now()},

  // query properties
  category:     String,
  tags:         Array,

  // aditional info
  emails:  Array,
  phones:  Array,
  urls:    Array,

  //
  locations:  [locationSchema]
});

// Methods
// Rate
/*providerSchema.methods.rate = function(userId, rate, callback) {
  userId = userId.toString().trim();
  if(!userId || !rate) return callback({error: 'UserId and rate are both required.', status: 400});
  if(isNaN(rate) || rate <= 0 || rate > 5) return callback({error: 'Rate must be a number between 1 and 5.', status: 400});

  this.ratings = this.ratings || {};

  var n = 0, l = 0, old = this.rating;
  this.ratings[userId] = rate;
  for(var i in this.ratings) {
    n += this.ratings[i];
    l++;
  }
  this.rating = Math.round(n / l);
  return callback(null, {rating: this.rating, old: old});
};*/

module.exports = mongoose.model('Provider', providerSchema);
