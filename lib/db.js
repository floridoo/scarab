var fs = require('fs');
var path = require('path');
var async = require('async');
var Databank = require('databank').Databank;
var DatabankObject = require('databank').DatabankObject;

var DB = function(app) {
	function init(callback) {
		var modelDir = path.join(app.config.rootDir, app.config.paths.models);
		var modelFiles = fs.readdirSync(modelDir);
		modelFiles.forEach(function(modelFile) {
			var modelName = modelFile.substring(0, modelFile.lastIndexOf('.')).camelize();
			var model = DatabankObject.subClass(modelName);

			var modelDef = require(path.join(modelDir, modelFile));
			if (Object.isFunction(modelDef))
				modelDef.call(model, app);

			model.adapter = model.adapter || app.config.db.defaultAdapter || app.config.db[0];
			model.bank = function() {
				return app.db[model.adapter];
			};
			app.models[modelName] = model;
			if (app.config.modelGlobals)
				global[modelName] = model;

			var dbConfig = app.config.db[model.adapter];
			dbConfig.settings = dbConfig.settings || {};
			dbConfig.settings.schema = dbConfig.settings.schema || {};
			if (model.schema)
				dbConfig.settings.schema[modelName] = model.schema;
		});

		async.each(Object.keys(app.config.db), function(adapterName, cb) {
			if (adapterName === 'defaultAdapter') return cb();

			var dbConfig = app.config.db[adapterName];
			var db = Databank.get(dbConfig.adapter, dbConfig.settings || {});
			app.db[adapterName] = db;
			db.connect({}, cb);
		}, callback);
	}

	function disconnect(callback) {
		async.each(Object.keys(app.db), function(adapterName, cb) {
			app.db[adapterName].disconnect(cb);
		}, callback);
	}

	return {
		init: init,
		disconnect: disconnect
	};
};

module.exports = DB;