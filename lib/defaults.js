module.exports = {

	paths: {
		config: 'config',
		init: 'init',
		models: 'models',
		controllers: 'controllers',
		views: 'views',
		policies: 'policies'
	},

	autoRoute: true,
	autoRoutePath: 'api',
	defaultControllerFactory: require('./default_controller_factory'),

	resourceRouting: {
		'all /:controller/all': 'all',
		'all /:controller/create/:key?': 'create',
		'all /:controller/:key/update': 'update',
		'all /:controller/:key/destroy': 'destroy',

		'get /:controller': 'all',
		'post /:controller': 'create',
		'get /:controller/:key': 'find',
		'put /:controller/:key': 'update',
		'post /:controller/:key': 'update',
		'delete /:controller/:key': 'destroy'
	},

	policies: {
		'*': true
	},

	viewEngines: {
		ejs: 'ejs',
		jade: 'jade'
	},

	modelGlobals: true,
	host: 'localhost',
	port: 3000
};
