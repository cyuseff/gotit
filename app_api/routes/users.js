"use strict";

var router = require('express').Router(),
	bodyParser = require('body-parser'),
	urlencode = bodyParser.urlencoded({extended:false}),
	controller = require('../controllers/users');



//*** /users  ***//
router.route('/')
	.get(urlencode, controller.listUsers)
	.post(urlencode, controller.createUser);

router.route('/:userid')
	.get(urlencode, controller.getUser)
	.put(urlencode, controller.updateUser)
	.delete(urlencode, controller.deleteUser);




module.exports = function(app){
  app.use('/api/users', router);
};
