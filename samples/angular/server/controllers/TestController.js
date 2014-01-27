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
