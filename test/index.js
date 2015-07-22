'use strict';

var dirName;
// App_Api
// Models

// Controllers
// Admin

// Site
dirName = './app_api/controllers/site';
// auth
require(dirName + '/auth/local-signin');
require(dirName + '/auth/local-login');
require(dirName + '/auth/revokeAllTokens');

require(dirName + '/users');
