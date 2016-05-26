
var moment  	= require('moment');

// import db schemas
var User = require('../db/user');
var Band = require('../db/band');


/// ---------- COMPUTE SCHEDULE ---------- ///
	
var computeScheduleForDay = function(telegramId, day, callback) {

	console.log("[SCHEDCTRL] Constructing schedule for user " + telegramId + ' for day '+ day);
	
	// get schedule object from DB
	User.findOne(
		{
			telegramId: telegramId
		},
		function(err, user){
			if (err) throw err;

			if(user){

				if(user.upToDateSchedule == true){

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
					callback(textSchedule);
				
				}
				else {

					computeEntireScheduleForUser(telegramId, function(){
						computeScheduleForDay(telegramId, day, callback)
					});

				}
			}
			else{
				console.log("[SCHEDCTRL] User " + telegramId + " not found while trying to compute schedule for day " + day);
			}

		}
	);
}

var computeEntireScheduleForUser = function(telegramId, callback) {

	// day in the format 'dd/mm/yyyy'

	console.log("[SCHEDCTRL] Computing entire schedule for user " + telegramId);

	var schedule = require('../models/schedule')

	// get user
	User.findOne(
		{
			telegramId: telegramId
		},
		function(err, user){
			if (err) throw err;

			if(user){

				// get bands info
				Band.find(
					{}, // where filter
					'lowercase uppercase startTime endTime stage',	// fields to return
					function (err, bands) {
						if (err) throw err;

						if(bands.length){

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

							// store schedule object into DB
							User.findOneAndUpdate(
								{ 
									telegramId: telegramId
								}, 
								{
									$set: { 
										schedule: objectSchedule,
										upToDateSchedule: true
									}
								}, 
								function(err, user){
									if (err) throw err;

									console.log("[SCHEDCTRL] Schedule object succesfully stored for user " + telegramId);

									callback();
								}
							);

						}
						else{

							console.log("[SCHEDCTRL] No bands found while trying to compute schedule for day " + day);

						}

					}
				);
			
			}
			else{
				console.log("[SCHEDCTRL] User " + telegramId + " not found while trying to compute entire schedule");
			}


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

			textSchedule += "<strong>" + objectSchedule[b]["uppercase"] + "</strong>\n\t<i>" + moment(objectSchedule[b]["start"]).format("HH:mm") + " | " + objectSchedule[b]["stage"] + "</i>\n";
		}

	}
	
	return(textSchedule);
}

module.exports = {
	computeScheduleForDay : computeScheduleForDay,
}