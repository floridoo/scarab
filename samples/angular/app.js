var scarab = require('scarab');
var app = require('./server');
var winstonMail = require('winston-mail').Mail;

app.logger.add(winstonMail, {
	to: 'florian.reiterer@card-emotion.com',
	host: '10.0.0.113',
	level: 'error'
});


scarab.run(app);
