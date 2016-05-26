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
[local git init + git commit] 
[create app in openshift]
- git remote add openshift -f ssh://5742e11d0c1e66b329000106@test-festook.rhcloud.com/~/git/test.git/
- git merge openshift/master -s recursive -X ours
- git push openshift master
[check logs in ssh]
*/






