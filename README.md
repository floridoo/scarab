# Scarab, a minimal web framework

Scarab is a thin wrapper around Express, providing on structure, configuration and database abstraction.
The structure is inspired by [Rails](http://rubyonrails.org/) and [Sails.js](http://sailsjs.org/), but with focus on keeping it simple. If the terms model, view, controller and route are new for you, please have a look at the documentation of Rails or Sails, as those do a better job on explaining them.

### Motivation behind Scarab
* use Express and existing libraries
* provide structure
* keep it simple and readable (~500 lines of code).

## Bootstrap the app

To start a server in the current directory:
```javascript
// index.js
var scarab = require('scarab');
module.exports = scarab(__dirname);
```


## Directory structure

By default Scarab looks for the following subdirectories:
* config
* init
* models
* controllers
* views
* policies

The directory names can be changed via `config.paths`.


## Configuration

Scarab imports and merges all files you put in the `config/` subdirectory into one object (`app.config`). In addition you can have subfolders for different environments (e.g. development, production), that override the settings put in the root config directory.

How you structure your settings (e.g. all in one file, split by purpose, etc.) is up to you. Just keep in mind that the files are loaded in alphabetical order, later files override earlier ones. Please see the `samples` directory in the repository for a possible structure.

The setttings you configure here can be for Scarab, or for you own use (via `app.config`).

The defaults for all the Scarab settings are in `lib/defaults.js`.


## Initialization

Each file put in `init/` must export a function with one parameter `app`. Those functions are run once after initializing the server.

## Models

Scarab uses [Databank](https://github.com/e14n/databank) for its models. Each model must export a `DatabankObject`. Please refer to the `Databank` documetation for further information.

By default the default database adapter specified in `config.db.defaultAdapter` is used. A model can use a different adapter by adding an `adapter` property.

Example:

```javascript
// models/User.js
module.exports = function() {
	this.adapter = 'redis';

	this.schema = {
		pkey: 'email'
	};

	this.prototype.beforeUpdate = function(props, callback) {
		delete props.role;
		callback(null, props);
	};
	
};
```

### AutoRoute

Each model automatically gets a REST endpoint. E.g. for the model `user.js` you get `api/users/` which lists all users and urls for adding, changing, deleting users. This can be disabled by setting `config.autoRoute = false` or restricted using policies.

Autorouting uses the routing defined in `config.resourceRouting`, and the controller defined in `config.defaultControllerFactory`. By changing those, the automatic API can be customized according to your needs.

To change the behavior of a single Model, specify your own router for that model.

Default routes for autorouting (see *Routes* for more information):

```javascript
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
```


## Controllers

A controller specifies behavior in one ore more *actions*. Each action is defined as an Express handler. By default, each controller extends/overrides the actions from the `defaultController` (see AutoRoute). To prevent this behavior and having only the actions defined in the controller, add the property `noDefaultActions: true`.

Example:

```javascript
// controllers/TestController.js
var fs = require('fs');
var path = require('path');
var test = [
	'first',
	'second',
	'third'
];

module.exports = {
	noDefaultActions: true,

	all: function(req, res, next) {
		res.send(test);
	},

	find: function(req, res, next) {
		var id = req.params.key;
		if (test[id])
			res.render('test.html.ejs', {title: test[id]});
		else
			res.send(404);
	}
};
```


## Routes

Routes are defined in `config.routes` using the following syntax:
```javascript
'<method> <path>': '<destination>'
```

* `<method>` can be:
	* one or more HTTP methods (e.g. `get`, `post`, `put`, `delete`), comma separated
	* `all`: allow all methods
	* `resource`: add all routes for a resource (`config.resourceRouting`)
	* `static`: serves static files
* `<path>`: the url path. Supports everything Express supports: strings with variables or regular expressions (see [Express routing](http://expressjs.com/api.html#app.VERB)).
* `<destination>` can be:
	* a path starting with `/`: redirect to the path
	* an absolute or relative path (only for `static`)
	* a controller name (only for `resource`)
	* a string `<controller>.<action>`: call `action` on `controller`. E.g. `user.create` calls `create` in file `UserController.js`
	* an Object with properties `controller` and `action` if you like to be more verbose

Example:

```javascript
// config/routes.js
module.exports.routes = {
	'get ^/admin$': '/admin/',

	'get /auth/user': 'user.show',
	'put,post /auth/login': 'user.login',
	'get /auth/logout': 'user.logout',

	'static /content': '../static/content'
};
```

## Views

Templates in various formats. Scarab supports a lot of template languages via [Consolidate](https://github.com/visionmedia/consolidate.js/). To use a template engine, you have to add it to `config.viewEngines`. Templates can be rendered using [res.render](http://expressjs.com/api.html#res.render). Use template filenames including the extension (e.g. *index.html.jade*). This way the right template engine is used to render it.

Example:

```javascript
res.render('test.html.ejs', {greeting: 'Hello world!'});
```

## Policies

Policies apply additional logic (in the form of connect middleware) to certain paths / controllers / actions. The policies are defined in the directory `policies/` and connected to controllers / actions via `config.policies`.

Example:

```javascript
// policies/admin.js
module.exports = function(req, res, next) {
	if(req.user && req.user.role === 'admin') {
		return next();
	}
	else {
		return res.send(403);
	}
};
```

```javascript
// config/policies.js
module.exports.policies = {

	User: {
	 	create: 'admin',
	 	update: 'admin',
	 	destroy: 'admin'
	},

	'/api/*': 'authenticated'
};
```

## Configuration

#### General
* `host`: Server Hostname (default: `localhost`)
* `port`: Server port (default: `8080`)
* `user`: User the server should run on (default: `undefined`, meaning the current user)
* `group`: Gropu the server should run on (default: `undefined`, meaning the current user)
* `logFile`: Logfile (default: `undefined`, only output to stdout)
* `modelGlobals`: if true, each model is added to the global namespace, otherwise just accessible by `app.models` (default: `true`)

#### Paths
* `paths`: change standard subdirectories

```javascript
module.exports.paths = {
	config: 'config',
	init: 'init',
	models: 'models',
	controllers: 'controllers',
	views: 'views',
	policies: 'policies'
};
```

#### Database
* `db.defaultAdapter`: name of the default adapter
* `db.<adaptername>.adapter`: name of the adapter (e.g. leveldb, redis)
* `db.<adaptername>.settings`: settings to be passed to the adapter

Example: 

```javascript
// config/db.js
module.exports.db = {
	defaultAdapter: 'redis',
	redis: {
		adapter: 'redis',
		settings: {
			host: '10.0.0.112',
			database: 0,
			checkIndices: true
		}
	}
};
```

#### Middleware
* `middleware`: a function which gets the app as a parameter. Define custom middleware here.

```javascript
// config/middleware.js
var passport = require('passport');
module.exports.middleware = function(app) {
	app.use(app.middleware.session({ secret: 'mysecret' }));
	app.use(passport.initialize());
	app.use(passport.session());
};
```

#### Autorouting
* `autoRoute`: automatically add resource routes for models (default: `true`)
* `autoRoutePath`: prefix for automatic routes (default: `api`)
* `defaultControllerFactory`: default controller actions (default: `require('./default_controller_factory.js')` in the package)
* `resourceRouting`: standard routes for resources and auto routes (default: see `lib/defaults.js`)

#### View engines

* `viewEngines`: maps file extensions to view engines. For a list of supported view engines see: [Consolidate](https://github.com/visionmedia/consolidate.js)

```javascript
// config/views.js
module.exports.viewEngines = {
	ejs: 'ejs',
	jade: 'jade'
};
```

#### Routes
* `routes`: See chapter **Routes** above

#### Policies
* `policies`: See chapter **Policies** above


## Asset compilation

Scarab does not bundle asset compilation functionality. The angular sample includes a Gruntfile that features file watching with live recompilation and automatic browser reload.

##### Usage:
* install [Grunt](http://gruntjs.com/): `npm install -g grunt-cli`
* start server: `grunt server`
* start server in production mode: `grunt server:dist`
* build assets for production: `grunt build`
