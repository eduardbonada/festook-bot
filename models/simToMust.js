
var _ 		= require('underscore');
var logger = require('../logger');

// import db schemas
var User = require('../db/user');
var Band = require('../db/band');

exports.computeBandSimilarityToMustBands = function(user){
	
	mustBands = user.mustBands

	logger.debug("Sim2must: Computing similarity to Must bands of user " + user.telegramId);

	var bandsSimToMust = {}

	// Get bands from DB
	var allBands = [];
	Band.find(
		{}, 
		function(err, bands){
			if(err) throw err;

			if(bands.length){
				allBands = bands;
				var maxDistToMust = maxDistanceToMust(allBands, mustBands);
				computeAllBandsSimilarityForUser(user, allBands, mustBands, maxDistToMust);
			}
			else{
				logger.warn("Sim2must: No bands found in the database.");
			}

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

			simToMust[allBands[band].lowercase] = 1; // store into temp array

			logger.trace("Sim2must: Setting similarity to must of band " + allBands[band].lowercase + " : 1");

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
			var normHarmMean 	= (harmMean - maxDist) / (minDist - maxDist)

			logger.trace("Sim2must: Computing similarity to must of band " + allBands[band].lowercase);
			logger.trace("Sim2must: - sumInvDist   : " + sumInvDist);
			logger.trace("Sim2must: - harmMean     : " + harmMean);
			logger.trace("Sim2must: - normHarmMean : " + normHarmMean);

			// store into temp array
			simToMust[allBands[band].lowercase] = normHarmMean;

		}

	}

	// store to Users collection
	User.findOneAndUpdate(
		{ 
			telegramId: user.telegramId
		}, 
		{
			$set: { 
				simToMust: simToMust
			}
		}, 
		function(err, user){
			if (err) throw err;
			logger.debug("Sim2must: Similarity to Must bands succesfully stored for user " + user.telegramId);
		}
	);


}
