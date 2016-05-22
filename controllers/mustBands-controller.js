// import db schemas
var User = require('../db/user');


/// ---------- COMPUTE SIMILARITIES TO MUST BANDS ---------- ///

var addMustBandForUser = function(telegramId, mustBand){

	// Store users must bands into DB
	User.findOneAndUpdate(
		{ 
			telegramId: telegramId
		}, 
		{
			$push: { 
				mustBands: mustBand
			}
		}, 
		function(err, user){
			if (err) throw err;

			if(user){
				console.log("[MUSTCTRL] Must bands succesfully stored for user " + user.telegramId);
				computeSimToMustBandsForUser(telegramId)
			}
			else{
				console.log("[MUSTCTRL] User " + telegramId + " not found while trying to add a must band");
			}

		}
	);

}

var removeMustBandForUser = function(telegramId, mustBand){

	// Store users must bands into DB
	User.findOneAndUpdate(
		{ 
			telegramId: telegramId
		}, 
		{
			$pull: { 
				mustBands: mustBand
			}
		}, 
		function(err, user){
			if (err) throw err;

			if(user){

				console.log("[MUSTCTRL] Must band succesfully removed for user " + user['telegramId']);
				
				if(user.mustBands.length>0){
					computeSimToMustBandsForUser(telegramId)
				}

			}
			else{
				console.log("[MUSTCTRL] User " + telegramId + " not found while trying to remove a must band");
			}

		}
	);

}

var computeSimToMustBandsForUser = function(telegramId){

	var simToMust = require('../models/simToMust')

	User.findOne(
		{
			telegramId: telegramId
		},
		function(err, user){
			if (err) throw err;

			if (user){
				if(user.mustBands.length>0){
					console.log("[MUSTCTRL] Computing Similarity to must bands for user " + user.telegramId);				
					simToMust.computeBandSimilarityToMustBands(user);
				}
			}
			else{
				console.log("[MUSTCTRL] User " + telegramId + " not found while trying to compute similarity to must bands");
			}
		});

}

module.exports = {
	addMustBandForUser : addMustBandForUser,
	removeMustBandForUser : removeMustBandForUser,
	computeSimToMustBandsForUser : computeSimToMustBandsForUser
}