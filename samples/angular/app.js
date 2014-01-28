var scarab = require('scarab');
var app = require('./server');
var winstonMail = require('winston-mail').Mail;

app.logger.add(winstonMail, {
	to: 'user@example.com',
	host: '10.0.0.113',
	level: 'error'
});


scarab.run(app);
