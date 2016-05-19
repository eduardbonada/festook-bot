// import db schemas
var User = require('../db/user');


/// ---------- COMPUTE SIMILARITIES TO MUST BANDS ---------- ///

exports.setMustBandsForUser = function(userName, mustBands){

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

exports.computeSimToMustBandsForUser = function(userName){

	var simToMust = require('../models/simToMust')

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