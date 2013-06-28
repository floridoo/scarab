require('sugar');

module.exports = function(models) {
	return {
		all: function(req, res, next) {
			var model = models[req.controller.camelize()];
			var data = Object.merge(req.body, req.query);
			model.search(data, function(err, result) {
				if (err) return next(err);
				res.send(result);
			});
		},

		find: function(req, res, next) {
			var model = models[req.controller.camelize()];
			model.get(req.params.key, function(err, result) {
				if (err) return next(err);
				res.send(result);
			});
		},

		create: function(req, res, next) {
			var model = models[req.controller.camelize()];
			var data = Object.merge(req.body, req.query);
			if(req.params.key !== undefined)
				data[model.pkey()] = req.params.key;
			model.create(data, function(err, result) {
				if (err) return next(err);
				res.send(201, result);
			});
		},

		update: function(req, res, next) {
			var model = models[req.controller.camelize()];
			var data = Object.merge(req.body, req.query);
			model.get(req.params.key, function(err, result) {
				if (err) {
					if (err.name === 'NoSuchThingError') {
						model.create(data, function(err, result) {
							if (err) return next(err);
							res.send(201, result);
						});
					} else {
						next(err);
					}
				} else {
					result.update(data, function(err, result) {
						if (err) return next(err);
						res.send(200, result);
					});
				}
			});
		},

		destroy: function(req, res, next) {
			var model = models[req.controller.camelize()];
			model.get(req.params.key, function(err, result) {
				if (err) return next(err);

				result.del(function(err) {
					if (err) return next(err);
					res.send(200, result);
				});
			});
		}
	};
};
