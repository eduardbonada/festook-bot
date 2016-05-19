/// ---------- LOAD DEPENDECIES ---------- ///

//var express  	= require('express');
//var app 	 	= express();
var mongoose 	= require('mongoose');

var config = require('./config');

var User = require('./models/user');
var Band = require('./models/band');

/// ---------- CONNECT TO DATABASE ---------- ///

mongoose.connect(config.database, function(err) {
	if (err) throw err;
	console.log("Connected to DB");

	//createUser('test_user_1');
	//setMustBandsForUser('test_user_1', ['interpol', 'thestrokes']);
	//computeSimToMustBandsForUser('test_user_1');

	computeSchedule('test_user_1')

});


/// ---------- USER MANAGEMENT ---------- ///

function createUser(userName){

	// create new user
	var newUser = new User({
		name: userName
	});

	// Attempt to save the band into DB
	newUser.save(function(err, user) {
		if (err) throw err;
		console.log("[SERVER] User " + user['name'] + " succesfully created");
	});

}

function setMustBandsForUser(userName, mustBands){

	// Store users must bands into DB
	User.findOneAndUpdate(
		{ 
			name: userName
		}, 
		{
			$set: { 
				mustBands: mustBands
			}
		}, 
		function(err, user){
			if (err) throw err;
			console.log("[SERVER] Must bands succesfully stored for user " + user['name']);
		}
	);

}

/// ---------- COMPUTE SIMILARITIES TO MUST BANDS ---------- ///

function computeSimToMustBandsForUser(userName){

	var simToMust = require('./simToMust')

	User.findOne(
		{
			name: userName
		},
		function(err, user){
			simToMust.computeBandSimilarityToMustBands(user);
		}
	);

}

/// ---------- COMPUTE SCHEDULE ---------- ///

function computeSchedule(userName) {

	var schedule = require('./schedule')

	var bandsToAttend = [];

	// get user
	User.findOne(
		{
			name: userName
		},
		function(err, user){

			// get bands info
			Band.find(
				{}, // where filter
				'lowercase uppercase startTime endTime stage',	// fields to return
				function (err, bands) {
					var bandsDict = {};
					for(b in bands){
						bandsDict[bands[b].lowercase] = bands[b];
					}
					
					bandsToAttend = schedule.generateSchedule(user, bandsDict);
					console.log("[SERVER] Bands to attend: " + bandsToAttend.join(' '));

				}
			);

		}
	);

}
