module.exports = function() {

	this.schema = {
		pkey: 'email'
	};

	this.prototype.beforeUpdate = function(props, callback) {
		delete props.role;
		callback(null, props);
	};
	
};
