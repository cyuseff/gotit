"use strict";

var router = require('express').Router()
  , ctrl = require('../controllers/users');


//*** /users  ***//
router.route('/')
	.get(ctrl.listUsers);

/*router.route('/:useruuid')
	.get(ctrl.getUser)
	.put(ctrl.updateUser)
	.delete(ctrl.deleteUser);*/




module.exports = function(app){
  app.use('/api/users', router);
};
