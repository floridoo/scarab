module.exports.policies = {

	// '*': 'authenticated',

	// sample: {
	// 	create: 'authenticated',
	// 	update: 'authenticated',
	// 	destroy: 'authenticated'
	// },

	'/auth/persona': 'auth_persona',
	'/api/*': 'authenticated',
	'/api/user*': 'admin'
};
