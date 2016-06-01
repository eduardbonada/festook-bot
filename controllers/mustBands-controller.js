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
			},
			$set: {
				upToDateSchedule: false,
				nextBandToList: 0
			}
		}, 
		function(err, user){
			if (err) throw err;

			if(user){
				global.log.debug("MustCtrl: Must bands succesfully stored for user " + user.telegramId);
				computeSimToMustBandsForUser(telegramId)
			}
			else{
				global.log.warn("MustCtrl: User " + telegramId + " not found while trying to add a must band");
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
			},
			$set: {
				upToDateSchedule: false,
				nextBandToList: 0
			}
		}, 
		function(err, user){
			if (err) throw err;

			if(user){

				global.log.debug("MustCtrl: Must band succesfully removed for user " + user['telegramId']);
				
				if(user.mustBands.length>0){
					computeSimToMustBandsForUser(telegramId)
				}

			}
			else{
				global.log.warn("MustCtrl: User " + telegramId + " not found while trying to remove a must band");
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
					global.log.debug("MustCtrl: Computing Similarity to must bands for user " + user.telegramId);				
					simToMust.computeBandSimilarityToMustBands(user);
				}
			}
			else{
				global.log.warn("MustCtrl: User " + telegramId + " not found while trying to compute similarity to must bands");
			}
		});

}

module.exports = {
	addMustBandForUser : addMustBandForUser,
	removeMustBandForUser : removeMustBandForUser,
	computeSimToMustBandsForUser : computeSimToMustBandsForUser
}