
var moment  	= require('moment');

// import db schemas
var User = require('../db/user');
var Band = require('../db/band');

/// ---------- COMPUTE SCHEDULE ---------- ///
	
var computeScheduleForDay = function(telegramId, day, callback) {

	global.log.debug("SchedCtrl: Constructing schedule for user " + telegramId + ' for day '+ day);
	
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
				global.log.warn("SchedCtrl: User " + telegramId + " not found while trying to compute schedule for day " + day);
			}

		}
	);
}

var computeEntireScheduleForUser = function(telegramId, callback) {

	// day in the format 'dd/mm/yyyy'

	global.log.debug("SchedCtrl:Computing entire schedule for user " + telegramId);

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
				Band.find({}, function (err, bands) {
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

								global.log.debug("SchedCtrl: Schedule object succesfully stored for user " + telegramId);

								callback();
							}
						);

					}
					else{

						global.log.warn("SchedCtrl: No bands found while trying to compute schedule for day " + day);

					}

				});
			
			}
			else{
				global.log.warn("SchedCtrl: User " + telegramId + " not found while trying to compute entire schedule");
			}


		}
	);
}

function objectRepresentationOfSchedule(bandsToAttend, bandsInfo){
	
	var scheduleObject = [];

	// Gather info for all bands to attend 
	for(b in bandsToAttend){

		var bandName = bandsToAttend[b];

		//console.log(JSON.stringify(bandsInfo[bandName]));

		var bandObj = {
			lowercase: bandsInfo[bandName].lowercase,
			uppercase: bandsInfo[bandName].uppercase,
			start: bandsInfo[bandName].startTime,
			end: bandsInfo[bandName].endTime,
			stage: bandsInfo[bandName].stage,	
			infoText: bandsInfo[bandName].infoText
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

		var bandStart = objectSchedule[b].start;

		if( moment(bandStart).isAfter(momentsRange.start) && moment(bandStart).isBefore(momentsRange.end) ) {

			textSchedule += "<strong>" + objectSchedule[b].uppercase + "</strong>\n" +
							"\t<i>" + objectSchedule[b].infoText + "</i>\n" +
							"\t" + moment(objectSchedule[b].start).format("HH:mm") + " | " + objectSchedule[b].stage + "\n";
		}

	}
	
	return(textSchedule);
}


/// ---------- NOW PLAYING ---------- ///

var nowPlaying = function(telegramId, callback) {

	global.log.debug("SchedCtrl: Gathering now playing bands for user " + telegramId);

	var now = moment();
	//var now = moment().add(3, 'days'); //.add(8, 'hours');
	//console.log(now.format('DD/MM/YYYY HH:mm'));

	var nowPlayingBands = [];
	
	Band.find({}, function(err, bands){
		if(err){
			callback(undefined);
		}
		if(bands.length){
			for(b in bands){
				var bandName = bands[b].uppercase;
				var startTime = moment(bands[b].startTime);
				var endTime = moment(bands[b].endTime);
				var stage = bands[b].stage;
				var infoText = bands[b].infoText;

				if(startTime.isBefore(now) && endTime.isAfter(now)){
					var remainingTime = moment.duration(endTime.diff(now));
					var remainingMinutes = remainingTime.asMinutes();
					nowPlayingBands.push({"bandName" : bandName, "startTime": startTime, "endTime": endTime, "stage" : stage, "remaining" : remainingMinutes, "infoText" : infoText});
				}
			}

			if(nowPlayingBands.length == 0){
				nowPlayingText = "";
			}
			else{

				// sort by remaining time
				var sortedNowPlayingBands = nowPlayingBands.sort(function(a,b) {
					if(a.remaining > b.remaining) return 1;
					else if(a.remaining < b.remaining) return -1;
					else return 0;
				});

				// construct now playing text
				var nowPlayingText = "";
				for (b in sortedNowPlayingBands){
					var bandName = sortedNowPlayingBands[b].bandName;
					var stage = sortedNowPlayingBands[b].stage;
					var infoText = sortedNowPlayingBands[b].infoText;
					var remaining = sortedNowPlayingBands[b].remaining;
					var remainingString = "";
					if(remaining<15) remainingString = " (finishing)";

					nowPlayingText += "<strong>" + bandName + "</strong> "+remainingString+"\n" +
									"\t<i>" + infoText + "</i>\n" +
									"\t" + stage + "\n"
				}
			}
			callback(nowPlayingText);
		}
		else{
			callback(undefined);
		}
	});
}


module.exports = {
	computeScheduleForDay : computeScheduleForDay,
	nowPlaying : nowPlaying,
}