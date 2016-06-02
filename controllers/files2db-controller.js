var logger = require('../logger');

//// ---------- ARGUMENTS ---------- ////

var festival 		= 'ps2016';
var listBandsFile 	= './festivals-info/' + festival + '_listBands.txt';
var matrixFile 		= './festivals-info/' + festival + '_echonestDB24_bandDistance.txt';

//// ---------- DEPENDECIES ---------- ////

var _ 			= require('underscore');
var moment 		= require('moment');
var mongoose 	= require('mongoose');

var Band 		= require('../db/band');
var config 		= require('../config');


var loadFestivalInfo = function(messageCallabck){

	logger.info("File2db: Loading festival info from files into DB");

	Band.remove({}, function(err) { 
		if(err){
			throw err;
			doneCallabck("There was an error trying to clear the DB");
		}
		else{
			loadListOfBands(function(){
				loadBandSimilarityMatrix(function(numBands){
					messageCallabck("Succesfully loaded info from " + numBands + " bands");
				});
			});
		}
	});
}


function loadListOfBands(doneCallback){

	logger.debug("File2db: Loading Lits of bands");

	// sync file load & json parse
	var bands = JSON.parse(require('fs').readFileSync(listBandsFile, 'utf8'));
	var numBands = Object.keys(bands).length;

	// loop bands and add them to DB
	var bandCount = 0
	for (bandName in bands){
		bandCount ++;

		// pick only the field we want to store
		var bandClean = _.pick(bands[bandName], 'lowercaseName', 'uppercaseName', 'startTime', 'endTime', 'stage', 'infoText');
		
		logger.trace('File2db: Saving band "' + bandClean.uppercaseName + '" into DB (' + bandCount + ' of ' + Object.keys(bands).length + ')');

		// create new band
		var newBand = new Band({
			lowercase: bandClean.lowercaseName,
			uppercase: bandClean.uppercaseName,
			startTime: moment(bandClean.startTime, 'DD/MM/YYYY HH:mm').format(),
			endTime:   moment(bandClean.endTime, 'DD/MM/YYYY HH:mm').format(),
			stage:     bandClean.stage,
			infoText:  bandClean.infoText
		});

		// Attempt to save the band into DB
		newBand.save(function(err, band, numAffected) {
			if (err) throw err;

			bandCount--; // decrement back to 0 to detect when last save is done

			if(bandCount == 0){
				logger.debug('File2db: Saved list of ' + numBands + ' bands');
				doneCallback();
			}
		});
	}
}


function loadBandSimilarityMatrix(doneCallback){

	logger.debug("File2db: Loading Lits Band Similarity Matrix");

	// sync file load & json parse
	var matrix = JSON.parse(require('fs').readFileSync(matrixFile, 'utf8'));

	// loop bands and add them to DB
	var bandCount = 0
	for (bandName in matrix){
		bandCount ++;
		var numBands = Object.keys(matrix).length;
	
		Band.findOneAndUpdate(
			{ 
				'lowercase':bandName
			}, 
			{
				$set: { 
					similarities: matrix[bandName]
				}
			}, 
			function(err, doc){
				if (err) throw err;

				bandCount--; // decrement back to 0 to detect when last save is done

				if(bandCount == 0){
					logger.debug('File2db: Saved similarities for ' + numBands + ' bands');
					doneCallback(numBands);
				}
			}
		);
	}
}

module.exports = {
	loadFestivalInfo : loadFestivalInfo,
}
