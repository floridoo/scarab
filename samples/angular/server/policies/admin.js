module.exports = function(req, res, next) {
	if(req.user && req.user.role === 'admin') {
		return next();
	}
	else {
		return res.send(403);
	}
};
