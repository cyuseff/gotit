"use strict";

var mongoose = require('mongoose'),
	bcrypt = require('bcrypt'),
	SALT_WORK_FACTOR = 10;


var userSchema = new mongoose.Schema({
	name: {type:String, required:true, unique: true},
  email: {type:String, required:true, unique: true},
  password: {type:String, required: true}
});

//Encript the user password before save
userSchema.pre('save', function(next){
	var user = this;

	if(!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
		if(err) return next(err);

		bcrypt.hash(user.password, salt, function(err, hash){
			if(err) return next(err);
			user.password = hash;
			next();
		});

	});

});

mongoose.model('User', userSchema);


/* Create a dummy user */
/*var User = mongoose.model('User');

User.create({
	name: 'Admin',
	email: 'admin@email.com',
	password: 'admin123',
}, function(err, user) {
	if (err) console.log(err);
	console.log('user created');
});*/
