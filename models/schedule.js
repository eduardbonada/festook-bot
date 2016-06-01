var config = require('../config');

var moment  = require('moment');

// import db schemas
var User = require('../db/user');
var Band = require('../db/band');

var freeSlots = []

exports.generateSchedule = function(user, bandsInfo){

	global.log.debug("Schedule: Computing schedule for user " + user.telegramId);

	// remove discarded bands
	var bandsToSort = user.simToMust
	global.log.trace("Schedule: Before Removing\n" + JSON.stringify(bandsToSort));
	for (db in user.avoidBands){
		//console.log("Remove " + user.avoidBands[db])
		delete bandsToSort[user.avoidBands[db]]
	}
	global.log.trace("Schedule: After Removing\n" + JSON.stringify(bandsToSort));


	// sort user bands by similarity
	var sortedBandNames = getSortedKeys(bandsToSort, "descending");
	global.log.trace("Schedule: Sorted\n" + JSON.stringify(sortedBandNames));

	// compute schedule with mode "FullConcert"
	freeSlots = [{"start": moment(config.festivalInfo.start), "end": moment(config.festivalInfo.end)}];
	var bandsToAttend = []
	for (b in sortedBandNames){ // (var b = 0 ; b < 5 ; b++) { 

		bandName = sortedBandNames[b]
		simToMust = user.simToMust[bandName];

		global.log.trace("Schedule: Trying to add " + bandName + " to the schedule");

		var slotIndex = isThereAFreeSlotBetweenDates(bandsInfo[bandName]["startTime"], bandsInfo[bandName]["endTime"]);
		
		if ( slotIndex != -1 ){ // if slot found
			
			global.log.trace("Schedule: Found a free slot for band " + bandName + " (" + moment(bandsInfo[bandName]["startTime"]).format("D HH:mm") + " - " + moment(bandsInfo[bandName]["endTime"]).format("D HH:mm") + ")");
			
			bandsToAttend.push(bandName);

			updateFreeSlotAfterAddingBand(bandName, slotIndex, bandsInfo);

		}
		else if( user.simToMust[bandName] == 1 ){ // if slot not found but it is a Must band

			global.log.trace("Schedule: No free slot for band " + bandName + " but it is a Must band (" + moment(bandsInfo[bandName]["startTime"]).format("D HH:mm") + " - " + moment(bandsInfo[bandName]["endTime"]).format("D HH:mm") + ")");

			// force to list of attending bands
			bandsToAttend.push(bandName);

		}
		else { // if slot not found and it is not a must band
			
			global.log.trace("Schedule: No free slot for band " + bandName + " (" + moment(bandsInfo[bandName]["startTime"]).format("D HH:mm") + " - " + moment(bandsInfo[bandName]["endTime"]).format("D HH:mm") + ")");

		}
	}

	global.log.trace("Schedule: Bands to attend\n" + JSON.stringify(bandsToAttend));

	return(bandsToAttend);
}

function isThereAFreeSlotBetweenDates(start, end){

	var startMoment = moment(start);
	var endMoment = moment(end);

	// loop all free slots to find an empty one
	for (fs in freeSlots) {
		var slotStartMoment = freeSlots[fs]["start"];
		var slotEndMoment = freeSlots[fs]["end"];

		// console.log("  Trying slot " + fs);
		// console.log("    slotStartMoment: " + slotStartMoment.toDate())
		// console.log("    slotEndMoment:   " + slotEndMoment.toDate())
		// console.log("    startMoment:     " + startMoment.toDate())
		// console.log("    endMoment:       " + endMoment.toDate())

		if( ( slotStartMoment.isBefore(startMoment) || slotStartMoment.isSame(startMoment) ) 
			&& 
			( slotEndMoment.isAfter(endMoment) || slotEndMoment.isSame(endMoment) ) ) 
		{
			return(fs);
		}
	}
	return(-1);
}

function updateFreeSlotAfterAddingBand(bandName, slotIndex, bandsInfo){

	var slotStartMoment = freeSlots[slotIndex]["start"];
	var slotEndMoment 	= freeSlots[slotIndex]["end"];
	var bandStartMoment = moment(bandsInfo[bandName]["startTime"]);
	var bandEndMoment 	= moment(bandsInfo[bandName]["endTime"]);

	// remove original slot
	freeSlots.splice(slotIndex,1);

	// create new slots:

	if ( slotStartMoment.isBefore(bandStartMoment) && slotEndMoment.isAfter(bandEndMoment) ) {
		// the full band slot falls in the middle of the free slot => two new free slots are created
		freeSlots.push({"start": slotStartMoment, "end": bandStartMoment});
		freeSlots.push({"start": bandEndMoment, "end":slotEndMoment});

	}

	if ( slotStartMoment.isSame(bandStartMoment) && slotEndMoment.isAfter(bandEndMoment) ){
		// the full band slot falls at the beginning of the free slot => one new free slots is created
		freeSlots.push({"start": bandEndMoment, "end":slotEndMoment});

	}

	if ( slotStartMoment.isBefore(bandStartMoment) && slotEndMoment.isSame(bandEndMoment) ){
		// the full band slot falls at the end of the free slot => one new free slots is created
		freeSlots.push({"start": slotStartMoment, "end":bandStartMoment});

	}

	if ( slotStartMoment.isSame(bandStartMoment) && slotEndMoment.isSame(bandEndMoment) ){
		// the full band slot is the same as the free slot => no new slot is created

	}

	//printFreeSlots();
}

function printFreeSlots(){
	global.log.debug("Schedule: Free Slots:")
	for (fs in freeSlots) {
		global.log.debug("  " + freeSlots[fs]["start"].format("D HH:mm") + " - " + freeSlots[fs]["end"].format("D HH:mm"))
	}
}

function getSortedKeys(obj, sortMethod) {
	// returns an array of sorted keys based on value and sortMethod

    var keys = []; 
    for(var key in obj) keys.push(key);

    if(sortMethod == "ascending"){
	    return keys.sort(function(a,b){ return obj[a]-obj[b]})
	}
	else if (sortMethod == "descending"){
	    return keys.sort(function(a,b){ return obj[b]-obj[a]}) 
	}
}