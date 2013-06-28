require('sugar');
var path = require('path');
var fs = require('fs');

/**
 * Automatic routing setup
 */
function Routing(app) {
	var config, defaultController;

	/**
	 * Find the action function based on controller name and action name.
	 * If no controller but a model is found, the default controller is taken.
	 * @param  {String} controllerName controller name
	 * @param  {String} actionName     action name
	 * @return {Function}              action function
	 */
	function getAction(controllerName, actionName) {
		controllerName = controllerName.camelize();
		var controller = app.controllers[controllerName];
		if (controller === undefined && app.models[controllerName])
			controller = defaultController;

		return controller[actionName || 'index'];
	}

	/**
	 * adds a single route
	 * @param {String} verb           HTTP verb
	 * @param {String} routePath      routing path
	 * @param {String} controllerName controller name
	 * @param {String} actionName     action name
	 */
	function addSingleRoute(verb, routePath, controllerName, actionName) {
		// add controller and action fields to the request
		var reqExtender = function(req, res, next) {
			req.controller = controllerName;
			req.action = actionName || 'index';
			next();
		};

		var params = [routePath, reqExtender];
		params = params.concat(getPolicies(controllerName, actionName));
		params.push(getAction(controllerName, actionName));

		app[verb].apply(app, params);
	}

	/**
	 * gets the policies in effect for a given controller and action
	 * @param  {String} controller
	 * @param  {String} action
	 * @return {Array}            policies
	 */
	function getPolicies(controller, action) {
		var policies = config.policies;
		var currentPolicies = [];
		if (policies[controller] && policies[controller][action]) {
			currentPolicies = policies[controller][action];
		} else if (Object.isString(policies[controller])) {
			currentPolicies = policies[controller];
		} else if (policies[controller] && policies[controller]['*']) {
			currentPolicies = policies[controller]['*'];
		} else if (policies['*']) {
			currentPolicies = policies['*'];
		}

		if (currentPolicies === true) {
			currentPolicies = [];
		}

		if (!Object.isArray(currentPolicies)) {
			currentPolicies = [currentPolicies];
		}

		currentPolicies = currentPolicies.map(function(policy) {
			var policyPath = path.join(config.rootDir, config.paths.policies, policy);
			return require(policyPath);
		});
		return currentPolicies;
	}

	/**
	 * parse the resource route definitions
	 */
	var resourceRouting;
	function parseResourceRoutes() {
		var routes = config.resourceRouting;
		resourceRouting = [];
		for (var route in routes) {
			var parsedRoute = parseRoute(route, routes[route]);
			// if it's a string it defines the action
			if (Object.isString(parsedRoute.target)) {
				parsedRoute.target = {action: parsedRoute.target};
			}
			resourceRouting.push(parsedRoute);
		}
	}

	/**
	 * add a resource route
	 * @param {String} routePath      route path
	 * @param {String} controllerName controller name
	 */
	function addResourceRoute(routePath, controllerName) {
		resourceRouting.forEach(function(route) {
			var actionPath = route.path.replace(':controller', controllerName);
			route.verbs.forEach(function (verb) {
				addSingleRoute(verb, actionPath, controllerName, route.target.action);
			});
		});
	}

	/**
	 * add a static route
	 * @param {String} routePath route path
	 * @param {String} target    target path (relative to the scarab root)
	 */
	function addStaticRoute(routePath, targets) {
		if (!Object.isArray(targets)) {
			targets = [targets];
		}
		targets.forEach(function(target) {
			if (target)
				app.use(routePath, app.middleware.static(path.resolve(config.rootDir, target)));
		});
	}

	function addRedirectRoute(verb, routePath, target) {
		app[verb](routePath, function(req, res) {
			res.redirect(target);
		});
	}

	/**
	 * apply the path policies (for static routes)
	 */
	function applyPathPolicies() {
		var allPolicies = [];
		for (var routePath in config.policies) {
			if (routePath.charAt(0) === '/') {
				var currentPolicies = config.policies[routePath];
				if (currentPolicies === true) {
					currentPolicies = [];
				}
				if (!Object.isArray(currentPolicies)) {
					currentPolicies = [currentPolicies];
				}
				allPolicies.push({route: routePath, policies: currentPolicies});
			}
		}
		allPolicies.forEach(function(pathPolicy) {
			pathPolicy.policies.forEach(function(policy) {
				var policyPath = path.join(config.rootDir, config.paths.policies, policy);
				app.all(pathPolicy.route, require(policyPath));
			});
		});
	}

	/**
	 * parse a route
	 * @param  {String} route  a route definition
	 * @param  {Object} target target definition
	 * @return {Object}        route parsed into verbs, path and target
	 */
	function parseRoute(route, target) {
		var verbs, routePath, routeParts;

		routeParts = route.split(' ');
		if (routeParts.length === 1) {
			verbs = ['all'];
			routePath = routeParts[0];
		} else {
			verbs = routeParts[0].split(',');
			verbs.map(function (verb) {
				return verb.trim().toLowerCase();
			});
			routePath = routeParts[1];
		}
		return {verbs: verbs, path: routePath, target: target};
	}

	/**
	 * initializes all routes
	 */
	function init() {
		config = app.config;

		defaultController = config.defaultControllerFactory(app.models);

		// load controllers
		var controllerDir = path.join(config.rootDir, config.paths.controllers);
		var controllerFiles = fs.readdirSync(controllerDir);
		controllerFiles.forEach(function(controllerFile) {
			var controllerName = controllerFile.substring(0, controllerFile.indexOf('Controller'));
			var controllerDef = require(path.join(controllerDir, controllerFile));
			var controller;
			if (controllerDef.noDefaultActions) {
				controller = controllerDef;
			} else {
				controller = Object.create(defaultController);
				controller = Object.merge(controller, controllerDef);
			}
			app.controllers[controllerName] = controller;
		});

		applyPathPolicies();

		var routes = config.routes,
			parsed = [];

		parseResourceRoutes();

		for (var route in routes) {
			parsed.push(parseRoute(route, routes[route]));
		}

		parsed.forEach(function(route) {
			if(!route.target)
				return;

			if (Object.isString(route.target)) {
				if (route.verbs[0] !== 'static' && route.target.charAt(0) === '/') {
					route.target = {redirect: route.target};
				} else {
					var parts = route.target.split('.');
					if (parts.length === 2) {
						route.target = {controller: parts[0], action: parts[1]};
					}
				}
			}
			if (!Object.isObject(route.target)) {
				route.target = {controller: route.target};
			}

			route.verbs.forEach(function (verb) {
				if (verb === 'resource') {
					addResourceRoute(route.path, route.target.controller);
				} else if (verb === 'static') {
					addStaticRoute(route.path, route.target.controller);
				} else if (route.target.redirect) {
					addRedirectRoute(verb, route.path, route.target.redirect);
				} else {
					addSingleRoute(verb, route.path, route.target.controller, route.target.action);
				}
			});
		});

		if(config.autoRoute) {
			resourceRouting.forEach(function(route) {
				var actionPath = path.join('/', config.autoRoutePath, route.path);
				route.verbs.forEach(function (verb) {
					app[verb](actionPath, function(req, res, next) {
						var controllerName = req.params.controller.singularize();
						var actionName = route.target.action;
						req.controller = controllerName;
						req.action = actionName;

						var action = getAction(controllerName, actionName);
						if (action) {
							var policies = getPolicies(controllerName, actionName);
							if (policies.length > 0) {
								var policyIdx = 0;
								var nextPolicy = function() {
									policyIdx++;
									if (policyIdx < policies.length) {
										policies[policyIdx](req, res, nextPolicy);
									} else {
										action(req, res, next);
									}
								};
								policies[0](req, res, nextPolicy);
							} else {
								action(req, res, next);
							}
						} else {
							next();
						}
					});
				});
			});
		}
	}

	return {
		init: init
	};
}

module.exports = Routing;
