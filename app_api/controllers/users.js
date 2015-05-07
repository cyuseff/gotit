"use strict";

var mongoose = require('mongoose');
var User = mongoose.model('User');

//helper function
function sendJsonResponse(res, status, content){
	res.status(status).json(content);
}

function formatList(name, content) {
	var obj = {};
	obj[name] = content;
	return obj;
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
			sendJsonResponse(res, 201, {name:user.name, email:user.email});
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
			if(!users) {
				sendJsonResponse(res, 404, {'message':'users not found'});
				return;
			}
			sendJsonResponse(res, 200, formatList('users', users));
		});




	//sendJsonResponse(res, 200, {users:[{user:'User001'}, {user:'User001'}]});
};
