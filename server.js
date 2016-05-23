/// ---------- LOAD DEPENDECIES ---------- ///

//var express  	= require('express');
//var app 	 	= express();
var mongoose 	= require('mongoose');


// import general configuration
var config = require('./config');

// import controllers files
var userCntrl = require('./controllers/user-controller');
var mustBandsCntrl = require('./controllers/mustBands-controller');
var scheduleCntrl = require('./controllers/schedule-controller');
var telegramCntrl = require('./controllers/telegram-controller');


/// ---------- CONNECT TO DATABASE ---------- ///

var mongoUrl = config.database;

// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    mongoUrl = process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME;
}


mongoose.connect(mongoUrl, function(err) {
	if (err) throw err;
	console.log("[SERVER] Connected to DB");

	// User Management
	//userCntrl.createUser('test_user_1');

	// Must Bands
	//mustBandsCntrl.setMustBandsForUser('test_user_1', ['interpol', 'thestrokes']);
	//mustBandsCntrl.computeSimToMustBandsForUser('test_user_1');

	// Schedule
	//scheduleCntrl.computeEntireScheduleForUser('test_user_1')
	//scheduleCntrl.computeScheduleForDay('test_user_1', '29/05/2015')

});


/*
HEROKU	
	http://mvalipour.github.io/node.js/2015/11/10/build-telegram-bot-nodejs-heroku/)

OPENSHIFT
	https://blog.openshift.com/run-your-nodejs-projects-on-openshift-in-two-simple-steps/
	https://github.com/ilbonte/node-telegram-bot-starter-kit
	https://github.com/yagop/node-telegram-bot-api/blob/master/examples/openShiftWebHook.js

http://stackoverflow.com/questions/12657168/can-i-use-my-existing-git-repo-with-openshift/12669112#12669112

*/






