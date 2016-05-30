
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

	console.log("[FILE2DB] Loading festival info from files into DB");

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

	// sync file load & json parse
	var bands = JSON.parse(require('fs').readFileSync(listBandsFile, 'utf8'));
	var numBands = Object.keys(bands).length;

	// loop bands and add them to DB
	var bandCount = 0
	for (bandName in bands){
		bandCount ++;

		// pick only the field we want to store
		var bandClean = _.pick(bands[bandName], 'lowercaseName', 'uppercaseName', 'startTime', 'endTime', 'stage');
		
		//console.log('[FILE2DB] Saving band "' + bandClean.uppercaseName + '" into DB (' + bandCount + ' of ' + Object.keys(bands).length + ')');

		// create new band
		var newBand = new Band({
			lowercase: bandClean.lowercaseName,
			uppercase: bandClean.uppercaseName,
			startTime: moment(bandClean.startTime, 'DD/MM/YYYY HH:mm').format(),
			endTime:   moment(bandClean.endTime, 'DD/MM/YYYY HH:mm').format(),
			stage:     bandClean.stage
		});

		// Attempt to save the band into DB
		newBand.save(function(err, band, numAffected) {
			if (err) throw err;

			bandCount--; // decrement back to 0 to detect when last save is done

			if(bandCount == 0){
				console.log('[FILE2DB] Saved list of ' + numBands + ' bands');
				doneCallback();
			}
		});
	}
}


function loadBandSimilarityMatrix(doneCallback){

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
					console.log('[FILE2DB] Saved similarities for ' + numBands + ' bands');
					doneCallback(numBands);
				}
			}
		);
	}
}

module.exports = {
	loadFestivalInfo : loadFestivalInfo,
}

/*
console.log(bandNames.length + " found in list of bands");
console.log(JSON.stringify(bandNames))
for(b in bandNames){

	if(bandNamesMatrix.indexOf(bandNames[b]) >= 0){
		//console.log("Band " + bandNames[b] + " found in both lists" );
	}else{
		console.log("Band " + bandNames[b] + " NOT found in both lists" );
	}

}

console.log("-----");

console.log(bandNamesMatrix.length + " found in matrix of bands");
console.log(JSON.stringify(bandNamesMatrix))
for(b in bandNamesMatrix){

	if(bandNames.indexOf(bandNamesMatrix[b]) >= 0){
		//console.log("Band " + bandNames[b] + " found in both lists" );
	}else{
		console.log("Band " + bandNamesMatrix[b] + " NOT found in both lists" );
	}

}
*/



