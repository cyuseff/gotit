"use strict";

var User = require('../models/user.js');

//helper function
function sendJsonResponse(res, status, content){
	res.status(status).json(content);
}

function formatList(name, content) {
	var obj = {};
	obj[name] = content;
	return obj;
}

function formatUser(user) {
	return {_id:user._id, name:user.name, email:user.email};
}




module.exports.createUser = function(req, res) {

	User.create({
		name: req.body.name,
	  email: req.body.email,
	  password: req.body.password,
	}, function(err, user) {
		if (err) {
			sendJsonResponse(res, 400, err);
		} else {
			sendJsonResponse(res, 201, formatUser(user));
		}
	});

};

module.exports.listUsers = function(req, res) {

	User
		.find({}, {name:1, email:1})
		.exec(function(err, users){
			if (err) {
				sendJsonResponse(res, 400, err);
				return;
			}
			sendJsonResponse(res, 200, formatList('users', users));
		});
};



module.exports.getUser = function(req, res){
	if(!req.params.userid) {
		sendJsonResponse(res, 404, {'message':'User id is required'});
		return;
	}

	User
		.findById(req.params.userid)
		.exec(function(err, user){
			if(!user) {
				sendJsonResponse(res, 404, {'message':'User not found'});
				return;
			} else if(err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			sendJsonResponse(res, 200, formatUser(user));

		});

};



module.exports.updateUser = function(req, res){

	if(!req.params.userid) {
		sendJsonResponse(res, 404, {'message':'User id is required'});
		return;
	}

	if(!req.body.email) {
		sendJsonResponse(res, 404, {'message':'Email is required'});
		return;
	}


	User
		.findById(req.params.userid)
		.exec(function(err, user){
			if(!user) {
				sendJsonResponse(res, 404, {'message':'User not found'});
				return;
			} else if(err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			user.email = req.body.email;

			user.save(function(err, usr){
				if(err) {
					sendJsonResponse(res, 404, err);
				} else {
					sendJsonResponse(res, 200, formatUser(usr));
				}
			});

		});

};



module.exports.deleteUser = function(req, res){

	if(!req.params.userid) {
		sendJsonResponse(res, 404, {'message':'User id is required'});
		return;
	}

	User
		.findByIdAndRemove(req.params.userid)
		.exec(function(err, user){
			if(err) {
				sendJsonResponse(res, 404, err);
				return;
			}

			if(!user) {
				sendJsonResponse(res, 404, {'message':'not found'});
				return;
			}

			sendJsonResponse(res, 204, null);

		});


	//Alternative way to do it, adding extra step into the code before deleting
	/*Loc
		.findById(req.params.locationid)
		.exec(function(err, location) {
			// Do something here
			location.remove(function(err, location){
				// Confirm success or failure
			});
		});
		*/
}
