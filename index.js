/// ---------- LOAD DEPENDECIES ---------- ///

//var express  	= require('express');
//var app 	 	= express();
var mongoose 	= require('mongoose');
var moment  	= require('moment');

var config = require('./config');

var User = require('./models/user');
var Band = require('./models/band');

/// ---------- CONNECT TO DATABASE ---------- ///

mongoose.connect(config.database, function(err) {
	if (err) throw err;
	console.log("[SERVER] Connected to DB");

	// User Management
	//createUser('test_user_1');

	// Must Bands
	//setMustBandsForUser('test_user_1', ['interpol', 'thestrokes']);
	//computeSimToMustBandsForUser('test_user_1');

	// Schedule
	//computeEntireScheduleForUser('test_user_1')
	computeScheduleForDay('test_user_1', '29/05/2015')

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
			if (err) throw err;
			simToMust.computeBandSimilarityToMustBands(user);
		}
	);

}

/// ---------- COMPUTE SCHEDULE ---------- ///
	
function computeScheduleForDay(userName, day) {

	console.log("[SERVER] Constructing schedule for user " + userName + ' for day '+ day);
	
	// get schedule object from DB
	User.findOne(
		{
			name: userName
		},
		function(err, user){
			if (err) throw err;

			if(user.schedule != null){

				// Sort by start time 
				var sortedSchedule = user.schedule.sort(function(a,b) {
					if ( moment(a.start).isAfter(moment(b.start)) ){ return 1; }
					else if (moment(a.start).isBefore(moment(b.start)) ){ return -1; }
					else{ return 0; }
				}); 

				// convert schedule object into text
				var textSchedule = textRepresentationOfScheduleInRange(
										sortedSchedule, 
										{
											start: moment(day + " 12:00", "D/MM/YYYY HH:mm"),
											end: moment(day + " 12:00", "D/MM/YYYY HH:mm").add(1, 'days')
										});
				console.log(textSchedule);
			
			}
			else {

				computeEntireScheduleForUser(userName, function(){
					computeScheduleForDay(userName, day)
				});

			}

		}
	);

}

function computeEntireScheduleForUser(userName, callback) {

	// day in the format 'dd/mm/yyyy'

	console.log("[SERVER] Computing entire schedule for user " + userName);

	var schedule = require('./schedule')

	// get user
	User.findOne(
		{
			name: userName
		},
		function(err, user){
			if (err) throw err;

			// get bands info
			Band.find(
				{}, // where filter
				'lowercase uppercase startTime endTime stage',	// fields to return
				function (err, bands) {
					if (err) throw err;

					var bandsDict = {};
					for(b in bands){
						bandsDict[bands[b].lowercase] = bands[b];
					}
					
					// generate schedule getting list of lowercase bands to attend
					var bandsToAttend = schedule.generateSchedule(user, bandsDict);
					
					// convert list of bands into an object with all bands info (name, stage, start, end)
					var objectSchedule = objectRepresentationOfSchedule(
											bandsToAttend, 
											bandsDict);
					//console.log(objectSchedule);

					// store schedule object into DB
					User.findOneAndUpdate(
						{ 
							name: userName
						}, 
						{
							$set: { 
								schedule: objectSchedule
							}
						}, 
						function(err, user){
							if (err) throw err;

							console.log("[SERVER] Schedule object succesfully stored for user " + user['name']);

							callback();
						}
					);

				}
			);

		}
	);

}

function objectRepresentationOfSchedule(bandsToAttend, bandsInfo){
	
	var scheduleObject = [];

	// Gather info for all bands to attend 
	for(b in bandsToAttend){

		var bandName = bandsToAttend[b];

		var bandObj = {
			lowercase: bandsInfo[bandName]["lowercase"],
			uppercase: bandsInfo[bandName]["uppercase"],
			start: bandsInfo[bandName]["startTime"],
			end: bandsInfo[bandName]["endTime"],
			stage: bandsInfo[bandName]["stage"]	
		};

		scheduleObject.push(bandObj);
		
	}

	// Sort by start time 
	var scheduleObjectSortedByStartTime = scheduleObject.sort(function(a,b) {
		if ( moment(a.start).isAfter(moment(b.start)) ){ return 1; }
		else if (moment(a.start).isBefore(moment(b.start)) ){ return -1; }
		else{ return 0; }
	}); 

	return(scheduleObjectSortedByStartTime);
}

function textRepresentationOfScheduleInRange(objectSchedule, momentsRange){

	var textSchedule = "";

	for(b in objectSchedule){

		var bandStart = objectSchedule[b]["start"];

		if( moment(bandStart).isAfter(momentsRange.start) && moment(bandStart).isBefore(momentsRange.end) ) {

			textSchedule += objectSchedule[b]["uppercase"] + " (" + moment(objectSchedule[b]["start"]).format("D HH:mm") + " " + objectSchedule[b]["stage"] + ")\n";
		}

	}
	
	return(textSchedule);

}
	










