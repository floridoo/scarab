var passport = require('passport');

module.exports.middleware = function(app) {

	var RedisStore = require('connect-redis')(app.middleware);
	var store = new RedisStore({
		host: app.config.db.redis.settings.host,
		db: app.config.db.redis.settings.database
	});
	app.use(app.middleware.session({ secret: 'mysecret', store: store, cookie: { secure: true }, proxy: true }));

	app.use(passport.initialize());
	app.use(passport.session());
	app.enable('trust proxy');

};
