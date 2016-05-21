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
			console.log("[MUST] Must bands succesfully stored for user " + user['telegramId']);
			computeSimToMustBandsForUser(telegramId)
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
			console.log("[MUST] Must band succesfully removed for user " + user['telegramId']);
			if(user.mustBands.length>0){
				computeSimToMustBandsForUser(telegramId)
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
			if(user.mustBands.length>0){
				simToMust.computeBandSimilarityToMustBands(user);
			}
		}
	);

}

module.exports = {
	addMustBandForUser : addMustBandForUser,
	removeMustBandForUser : removeMustBandForUser,
	computeSimToMustBandsForUser : computeSimToMustBandsForUser
}