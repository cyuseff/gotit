'use strict';

var dirName;
// App_Api
dirName = './app_api/models';
// Models
require(dirName + '/user');
require(dirName + '/rol');
/*
// Controllers
// Admin

// Site
dirName = './app_api/controllers/site';
// auth
require(dirName + '/auth/local-signin');
require(dirName + '/auth/local-login');
require(dirName + '/auth/revokeAllTokens');

require(dirName + '/users');
*/
