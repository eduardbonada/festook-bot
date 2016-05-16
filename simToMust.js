var _ 		= require('underscore');
var Band 	= require('./models/band');
var User 	= require('./models/user');


exports.computeBandSimilarityToMustBands = function(user){
	
	mustBands = user['mustBands']

	console.log("SIM2MUST: Computing similarity to Must bands of user " + user['name'] + ": " + mustBands);

	var bandsSimToMust = {}

	// Get bands from DB
	var allBands = [];
	Band.find(
		{}, 
		function(err, bands){
			if(err) throw err;

			allBands = bands;
			var maxDistToMust = maxDistanceToMust(allBands, mustBands);
			computeAllBandsSimilarityForUser(user, allBands, mustBands, maxDistToMust);

		}
	);
}

function maxDistanceToMust(allBands, mustBands){
	var allDistancesToMustBands = [];
	for(band in allBands){
		var distancesToMust = _.pick(allBands[band].similarities, mustBands);
		for(must in distancesToMust){
			allDistancesToMustBands.push(parseFloat(distancesToMust[must]));
		}
	}
	return Math.max.apply(null, allDistancesToMustBands);
}

function computeAllBandsSimilarityForUser(user, allBands, mustBands, maxDist){

	var simToMust = {}

	for(band in allBands){

		// if it is a must band
		if( mustBands.indexOf(allBands[band].lowercase) != -1){ 
 			// console.log("Similarity of " + allBands[band].lowercase + ": 1");

			// store into temp array
			simToMust[allBands[band].lowercase] = 1;

		}
		// not a must band
		else{

			// collect disances to must bands and invert them (1/x)
			var invDistToMust = [];
			var distancesToMust = _.pick(allBands[band].similarities, mustBands);
			for(must in distancesToMust){
				invDistToMust.push(1/parseFloat(distancesToMust[must]));
			}

			// similarity = normalized harmonic mean distance to all mustBands
			var minDist 		= 0;
			var sumInvDist 	 	= invDistToMust.reduce(function(a, b){ return  a+b}); // sum values in invDistToMust
			var harmMean 	 	= mustBands.length / sumInvDist;
			var normharmMean 	= (harmMean - maxDist) / (minDist - maxDist)

			// store into temp array
			simToMust[allBands[band].lowercase] = normharmMean;

 			//console.log("Similarity of " + allBands[band].lowercase + ": " + normharmMean);

		}

	}

	// store to Users collection
	User.findOneAndUpdate(
		{ 
			name: user['name']
		}, 
		{
			$set: { 
				simToMust: simToMust
			}
		}, 
		function(err, user){
			if (err) throw err;
			console.log("SIM2MUST: Similarity to Must bands succesfully stored for user " + user['name']);
		}
	);


}
