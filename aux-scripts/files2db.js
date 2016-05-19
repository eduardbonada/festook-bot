
//// ---------- ARGUMENTS ---------- ////

var festival 		= 'ps2015';
var listBandsFile 	= '../festivals-info/' + festival + '_listBands.txt';
var matrixFile 		= '../festivals-info/' + festival + '_echonestDB12-lastfmDB12_bandDistance.txt';

//// ---------- DEPENDECIES ---------- ////

var _ 			= require('underscore');
var moment 		= require('moment');
var mongoose 	= require('mongoose');

var Band 		= require('../models/band');
var config 		= require('../config');


//// ---------- CONNECT TO DATABASE ---------- ////

mongoose.connect(config.database, function(err) {
	if (err) throw err;

	console.log("Connected to DB");

	//loadListOfBands();

	//loadBandSimilarityMatrix();

});

//// ----- LIST BANDS ----- ////

function loadListOfBands(){

	// sync file load & json parse
	var bands = JSON.parse(require('fs').readFileSync(listBandsFile, 'utf8'));

	// loop bands and add them to DB
	var bandCount = 0
	for (bandName in bands){
		bandCount ++;

		// pick only the field we want to store
		var bandClean = _.pick(bands[bandName], 'lowercaseName', 'uppercaseName', 'startTime', 'endTime', 'stage');
		
		console.log('Saving band "' + bandClean.uppercaseName + '" into DB (' + bandCount + ' of ' + Object.keys(bands).length + ')');

		// create new band
		var newBand = new Band({
			lowercase: bandClean.lowercaseName,
			uppercase: bandClean.uppercaseName,
			startTime: moment(bandClean.startTime, 'DD/MM/YYYY HH:mm').format(),
			endTime:   moment(bandClean.endTime, 'DD/MM/YYYY HH:mm').format(),
			stage:     bandClean.stage
		});

		// Attempt to save the band into DB
		newBand.save(function(err) {
			if (err) throw err;
		});

	}

}


//// ----- BAND SIMILARITY MATRIX ----- ////

function loadBandSimilarityMatrix(){

	// sync file load & json parse
	var matrix = JSON.parse(require('fs').readFileSync(matrixFile, 'utf8'));

	// loop bands and add them to DB
	var bandCount = 0
	for (bandName in matrix){
		bandCount ++;

		console.log('Saving similarities of band "' + bandName + '" into DB (' + bandCount + ' of ' + Object.keys(matrix).length + ')');
	
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
			}
		);

	}

}






