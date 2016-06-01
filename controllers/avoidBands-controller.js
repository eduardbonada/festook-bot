// import db schemas
var User = require('../db/user');


/// ---------- UPDATE AVOID BANDS ---------- ///

var addAvoidBandForUser = function(telegramId, avoidBand){

	// Store users avoid bands into DB
	User.findOneAndUpdate(
		{ 
			telegramId: telegramId
		}, 
		{
			$push: { 
				avoidBands: avoidBand
			},
			$set: {
				upToDateSchedule: false
			}
		}, 
		function(err, user){
			if (err) throw err;

			if(user){
				console.log("[AVOIDCTRL] Avoid bands succesfully stored for user " + user.telegramId);
			}
			else{
				console.log("[AVOIDCTRL] User " + telegramId + " not found while trying to add an avoid band");
			}

		}
	);

}

var removeAvoidBandForUser = function(telegramId, avoidBand){

	// Store users avoid bands into DB
	User.findOneAndUpdate(
		{ 
			telegramId: telegramId
		}, 
		{
			$pull: { 
				avoidBands: avoidBand
			},
			$set: {
				upToDateSchedule: false
			}
		}, 
		function(err, user){
			if (err) throw err;

			if(user){
				console.log("[AVOIDCTRL] Avoid band succesfully removed for user " + user['telegramId']);
			}
			else{
				console.log("[AVOIDCTRL] User " + telegramId + " not found while trying to remove a avoid band");
			}

		}
	);

}

module.exports = {
	addAvoidBandForUser : addAvoidBandForUser,
	removeAvoidBandForUser : removeAvoidBandForUser
}