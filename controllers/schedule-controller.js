
var moment  	= require('moment');

// import db schemas
var User = require('../db/user');
var Band = require('../db/band');


/// ---------- COMPUTE SCHEDULE ---------- ///
	
var computeScheduleForDay = function(userName, day) {

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

var computeEntireScheduleForUser = function(userName, callback) {

	// day in the format 'dd/mm/yyyy'

	console.log("[SERVER] Computing entire schedule for user " + userName);

	var schedule = require('../models/schedule')

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

module.exports = {
	computeScheduleForDay : computeScheduleForDay,
	computeEntireScheduleForUser : computeEntireScheduleForUser
}