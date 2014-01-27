var passport = require('passport');

module.exports.middleware = function(app) {

	app.use(app.middleware.session({ secret: 'mysecret' }));
	app.use(passport.initialize());
	app.use(passport.session());

};
