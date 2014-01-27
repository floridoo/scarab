/**
 * Route definitions:
 * Example:
 *    // Route GET and POST requests from / to the controller "TestController", default action "index"
 *    'get,post /': 'test',
 *
 *    // Routes PUT requests from /test to the controller "TestController" and action "testAction"
 *    'put /test': {
 *        controller: 'test',
 *        action: 'testAction'
 *    },
 *
 *    // Short form for the above:
 *    'put /test': 'test.testAction',
 *
 *    // Adds resource routes from /test2/* to the controller "TestController" as defined in the
 *    // resourceRouting setting
 *    'resource /test2': 'test',
 *
 *    // Adds a static route from /files to the file system path 'assets' (relative to the scarab root)
 *    'static /files': 'assets'
 *
 *    // Add a redirect from /path to /destination (target needs to begin with a /)
 *    'get /path': '/destination'
 */

module.exports.routes = {
	'get ^/admin$': '/admin/',
	'static /': '../dist',

	// 'get /auth/user': 'auth.user',
	// 'post /auth/persona': 'auth.user',
	// 'get /auth/logout': 'auth.logout',

	// 'static /content': '../static/content'
};


/**
 * Automatically route to controllers of the same name.
 * If the controller does not exist but a model does, the
 * default controller is used.
 * Defaults below:
 */
// module.exports.autoRoute = true;
// module.exports.autoRoutePath = 'api';
// module.exports.defaultController: require('scarab/DefaultController');

// module.exports.resourceRouting = {
// 		'all /:controller/all': 'all',
// 		'all /:controller/create/:id?': 'create',
// 		'all /:controller/:id/update': 'update',
// 		'all /:controller/:id/destroy': 'destroy',

// 		'get /:controller': 'all',
// 		'get /:controller/:id': 'find',
// 		'post /:controller/:id?': 'create',
// 		'put /:controller/:id': 'update',
// 		'delete /:controller/:id': 'destroy'
// };
