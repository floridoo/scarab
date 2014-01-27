/* global User: false */
var passport = require('passport');
var PersonaStrategy = require('passport-persona').Strategy;

module.exports = function(app) {
	passport.serializeUser(function(user, done) {
		done(null, user.email);
	});

	passport.deserializeUser(function(email, done) {
		User.get(email, function(err, user) {
			done(err, user);
		});
	});

	passport.use(new PersonaStrategy({
		audience: app.config.audience
	}, function(email, done) {
		User.get(email, function(err, user) {
			if(err) {
				if (err.name === 'NoSuchThingError') {
					return done(null, false);
				} else {
					return done(err);
				}
			}
			done(null, user);
		});
	}));
};
