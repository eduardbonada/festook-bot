var config = require('./config');
var logger = require('./logger');

global.logLevel = global.logLevels.info;

/// ---------- LOAD DEPENDECIES ---------- ///

var express  	= require('express');
var http 		= require('http');
var mongoose 	= require('mongoose');
var app = express();
var server = http.createServer(app);


/// ---------- IMPORT CONTROLLERS ---------- ///

var files2db 		= require('./controllers/files2db-controller');
var userCntrl 		= require('./controllers/user-controller');
var mustBandsCntrl 	= require('./controllers/mustBands-controller');
var scheduleCntrl 	= require('./controllers/schedule-controller');
var telegramCntrl 	= require('./controllers/telegram-controller')(app);


/// ---------- SERVER SETUP & RUN ---------- ///

app.get('/', function(req, res){
	res.send("Great Scott!");
});

app.get('/loadFestivalInfo', function(req, res){
	files2db.loadFestivalInfo(function(message){
		res.send(message);
	});
});

var localIP;
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
	logger.info("Server: Local IP is " + add);
	localIP = add;
	
	app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
	app.set('ip', process.env.OPENSHIFT_NODEJS_IP || localIP);

	var mongoUrl = 'mongodb://localhost/festook-bot';
	if(process.env.OPENSHIFT_MONGODB_DB_URL){
		mongoUrl = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME;
	}
	mongoose.connect(mongoUrl, function(err) {
		if (err) throw err;
		logger.info('Server: Succesfully connected to DB');

			// start the server once the db has been succesfully set
			server.listen(app.get('port'), app.get('ip'), function() {
				logger.info('Server: Listening at ' + app.get('ip') + ":" + app.get('port'));
			});
		});
});

/*
MongoDB 2.4 database added.  Please make note of these credentials:

   Root User:     admin
   Root Password: 86ZgvmHdMqMh
   Database Name: primavera2016

Connection URL: mongodb://$OPENSHIFT_MONGODB_DB_HOST:$OPENSHIFT_MONGODB_DB_PORT/
*/

/*
HEROKU	
	http://mvalipour.github.io/node.js/2015/11/10/build-telegram-bot-nodejs-heroku/)

OPENSHIFT
	https://blog.openshift.com/run-your-nodejs-projects-on-openshift-in-two-simple-steps/
	https://github.com/ilbonte/node-telegram-bot-starter-kit
	

*/






