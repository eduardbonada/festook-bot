/// ---------- LOAD DEPENDECIES ---------- ///

var express  	= require('express');
var http 		= require('http');
var mongoose 	= require('mongoose');
var bodyParser 	= require('body-parser');

app.use(bodyParser.json());

// import configuration file
var config = require('./config');

// import controllers files
var files2db 		= require('./controllers/files2db-controller');
var userCntrl 		= require('./controllers/user-controller');
var mustBandsCntrl 	= require('./controllers/mustBands-controller');
var scheduleCntrl 	= require('./controllers/schedule-controller');
var telegramCntrl 	= require('./controllers/telegram-controller');


/// ---------- SERVER SETUP ---------- ///
var app = express();
var server = http.createServer(app);

app.use(bodyParser.json());

app.get('/', function(req, res){
	res.send("Great Scott!");
});

app.get('/loadFestivalInfo', function(req, res){
	files2db.loadFestivalInfo(function(message){
		res.send(message);
	});
});


/// ---------- SERVER RUN ---------- ///
var localIP;
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
	console.log("[SERV] Local IP is " + add);
	localIP = add;
	
	app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 3000);
	app.set('ip', process.env.OPENSHIFT_NODEJS_IP || localIP);

	var mongoUrl = config.database;
	mongoose.connect(mongoUrl, function(err) {
		if (err) throw err;
		console.log('[SERV] Succesfully connected to DB');

			// start the server once the db has been succesfully set
			server.listen(app.get('port'), app.get('ip'), function() {
				console.log('[SERV] Server listening at ' + app.get('ip') + ":" + app.get('port'));
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
	https://github.com/yagop/node-telegram-bot-api/blob/master/examples/openShiftWebHook.js

http://stackoverflow.com/questions/12657168/can-i-use-my-existing-git-repo-with-openshift/12669112#12669112
[local git init + git commit] 
[create app in openshift]
- git remote add openshift -f ssh://5742e11d0c1e66b329000106@test-festook.rhcloud.com/~/git/test.git/
- git merge openshift/master -s recursive -X ours
- git push openshift master
[check logs in ssh]
*/






