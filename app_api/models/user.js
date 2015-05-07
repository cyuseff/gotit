"use strict";

module.exports = function(mongoose){

	var bcrypt = require('bcrypt');
	var SALT_WORK_FACTOR = (process.env.NODE_ENV == 'production')? 10 :  1;


	var userSchema = new mongoose.Schema({
		name: {type:String, required:true, unique: true},
	  email: {type:String, required:true, unique: true},
	  password: {type:String, required:true},
		admin: {type: Boolean, required:true, default:false}
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

	// Password verification
	userSchema.methods.comparePassword = function(candidatePassword, cb) {
		bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
			if(err) return cb(err);
			cb(null, isMatch);
		});
	};

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

		user.comparePassword('aers', function(){
			console.log('aers');
			console.log(arguments);
		});
		user.comparePassword('admin123', function(){
			console.log('admin123');
			console.log(arguments);
		});

	});*/
}
