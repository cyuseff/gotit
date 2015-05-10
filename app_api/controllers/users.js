"use strict";

var hh = require('../helpers/helpers');
var User = require('../models/user.js');

module.exports.listUsers = function(req, res) {

	User
		.find({}, {name:1, email:1, uuid:1, _id:0})
		.exec(function(err, users){
			if (err) {
				hh.sendJsonResponse(res, 400, err);
				return;
			}
			hh.sendJsonResponse(res, 200, hh.formatList('users', users));
		});
};



module.exports.getUser = function(req, res){
	if(!req.params.useruuid) {
		hh.sendJsonResponse(res, 404, {'message':'User uuid is required'});
		return;
	}

	User

		.findOne({uuid:req.params.useruuid})
		.exec(function(err, user){
			if(!user) {
				hh.sendJsonResponse(res, 404, {'message':'User not found'});
				return;
			} else if(err) {
				hh.sendJsonResponse(res, 404, err);
				return;
			}

			hh.sendJsonResponse(res, 200, hh.formatUser(user));

		});

};



module.exports.updateUser = function(req, res){

	if(!req.params.useruuid) {
		hh.sendJsonResponse(res, 404, {'message':'User id is required'});
		return;
	}

	if(!req.body.email) {
		hh.sendJsonResponse(res, 404, {'message':'Email is required'});
		return;
	}


	User
		.findOne({uuid:req.params.useruuid})
		.exec(function(err, user){
			if(!user) {
				hh.sendJsonResponse(res, 404, {'message':'User not found'});
				return;
			} else if(err) {
				hh.sendJsonResponse(res, 404, err);
				return;
			}

			user.email = req.body.email;

			user.save(function(err, usr){
				if(err) {
					hh.sendJsonResponse(res, 404, err);
				} else {
					hh.sendJsonResponse(res, 200, hh.formatUser(usr));
				}
			});

		});

};



module.exports.deleteUser = function(req, res){

	if(!req.params.useruuid) {
		hh.sendJsonResponse(res, 404, {'message':'User id is required'});
		return;
	}

	User
		.findOneAndRemove({uuid:req.params.useruuid})
		.exec(function(err, user){
			if(err) {
				hh.sendJsonResponse(res, 404, err);
				return;
			}

			if(!user) {
				hh.sendJsonResponse(res, 404, {'message':'not found'});
				return;
			}

			hh.sendJsonResponse(res, 204, null);

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
