require('sugar');
var express = require('express'),
	path = require('path'),
	fs = require('fs'),
	http = require('http'),
	async = require('async'),
	consolidate = require('consolidate'),
	winston = require('winston'),
	multipart = require('connect-multiparty');

var logger = new winston.Logger({
	transports: [
		new winston.transports.Console({ colorize: true })
	]
});

process.on('uncaughtException', function(err) {
	logger.error(err.stack, function() {
		process.exit(-1);
	});
});

function scarab(rootDir) {
	var app = express();
	app.config = require('./defaults');
	app.config.rootDir = rootDir;

	app.middleware = express;
	app.logger = logger;
	app.winston = winston;

	var Routing = require('./routing')(app);
	var DB = require('./db')(app);

	function readConfigFiles(configDir) {
		if (fs.existsSync(configDir)) {
			var configFiles = fs.readdirSync(configDir);
			configFiles.forEach(function(configFile) {
				var filePath = path.join(configDir, configFile);
				var stats = fs.statSync(filePath);
				try {
					if (stats.isFile())
						Object.merge(app.config, require(filePath), true);
				} catch(e) {
					logger.warn('Unable to read config file ' + filePath);
				}
			});
		}
	}
	// read config files
	var configDir = path.join(rootDir, app.config.paths.config);
	readConfigFiles(configDir);
	app.set('env', app.config.env || app.get('env'));
	var environmentConfigDir = path.join(configDir, app.get('env'));
	readConfigFiles(environmentConfigDir);
	app.set('port', process.env.PORT || app.config.port);

	app.init = function(callback) {
		logger.info('initializing application...');
		app.db = {};
		app.models = {};
		app.controllers = {};

		if (app.config.logFile && !logger.transports.file) {
			logger.add(winston.transports.File, {
				filename: app.config.logFile,
				json: false
			});
		}

		// setup view engines
		app.set('views', path.join(rootDir, app.config.paths.views));
		for (var extension in app.config.viewEngines) {
			var engine = app.config.viewEngines[extension];
			app.engine(extension, consolidate[engine]);
		}

		app.use(express.cookieParser());
		app.use(express.json());
		app.use(express.urlencoded());
		app.use(multipart());

		var winstonStream = {
			write: function(message) {
				logger.info(message);
			}
		};
		app.use(express.logger({
			stream: winstonStream
		}));

		// setup custom middleware
		app.config.middleware(app);

		// setup routing
		app.use(app.router);
		Routing.init();

		app.use(function(err, req, res, next) {
			if (err.name === 'NoSuchThingError' || err.code === 'ENOENT') {
				err.status = 404;
			}
			next(err);
		});

		if ('development' === app.get('env')) {
			app.use(express.errorHandler());
		} else {
			app.use(function(err, req, res, next) {
				logger.error(err.stack);
				next(err);
			});
		}

		// setup db
		DB.init(function(err) {
			if (err) return callback(err);

			// run init files
			var initDir = path.join(rootDir, app.config.paths.init);
			var initFiles = fs.readdirSync(initDir);
			async.each(initFiles, function(initFile, cb) {
				var initFunc = require(path.join(initDir, initFile));
				if (initFunc.length <= 1) {
					initFunc(app);
					cb();
				} else {
					initFunc(app, cb);
				}
			}, function(err) {
				if (callback)
					callback(err);
			});
		});

	};


	app.teardown = function(cb) {
		logger.info('shutting down...');
		DB.disconnect(function(err) {
			cb(err);
		});
	};

	app.scarab = scarab;
	return app;
}

scarab.run = function(app, cb) {
	scarab.server = http.createServer();
	scarab.server.listen(app.get('port'), function() {
		if (app.config.group)
			process.setgid(app.config.group);
		if (app.config.user)
			process.setuid(app.config.user);
		app.init(function(err) {
			if (err) throw err;

			scarab.server.on('request', app);
			scarab.server.app = app;

			logger.info('scarab server listening on port ' + app.get('port') + ' in ' + app.get('env') + ' mode.');
			if (cb) cb(scarab.server);
		});
	});

	var quit = function() {
		scarab.server.app.teardown(function(err) {
			if (err) throw err;
			process.exit();
		});
	};
	process.on('SIGTERM', quit);
	process.on('SIGINT', quit);
	process.on('SIGHUP', scarab.reload);
};

scarab.uncache = function() {
	for (var file in require.cache) {
		delete require.cache[file];
	}
};

scarab.replaceApp = function(app, cb) {
	if (!(scarab.server && scarab.server.app))
		return cb(new Error('No server running'));

	var oldApp = scarab.server.app;
	oldApp.teardown(function() {
		scarab.uncache();
		app.init(function(err) {
			if (err) return cb(err);
			scarab.server.removeAllListeners('request');
			scarab.server.on('request', app);
			scarab.server.app = app;
			cb();
		});
	});
};

scarab.reload = function(cb) {
	logger.info('reloading server...');
	var app = scarab(scarab.server.app.config.rootDir);
	scarab.replaceApp(app, function(err) {
		if (err) {
			if (cb) return cb(err);
			else throw err;
		}
		return cb && cb(null, app);
	});
};
module.exports = scarab;