"use strict";

//helper function
module.exports.sendJsonResponse = function(res, status, content) {
	res.status(status).json(content);
}

module.exports.formatList = function(name, content) {
	var obj = {};
	obj[name] = content;
	return obj;
}

module.exports.formatUser = function(user) {
	return {uuid:user.uuid, name:user.name, email:user.email};
}

module.exports.ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.sendStatus(401);
}
