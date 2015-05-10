"use strict";

var router = require('express').Router(),
	controller = require('../controllers/users');


//*** /users  ***//
router.route('/')
	.get(controller.listUsers);

router.route('/:useruuid')
	.get(controller.getUser)
	.put(controller.updateUser)
	.delete(controller.deleteUser);




module.exports = function(app){
  app.use('/api/users', router);
};
