var User = require('../db/user');
var logger = require('../logger');


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
				logger.debug("AvoidCtrl: Avoid bands succesfully stored for user " + user.telegramId);
			}
			else{
				logger.warn("AvoidCtrl: User " + telegramId + " not found while trying to add an avoid band");
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
				logger.debug("AvoidCtrl: Avoid band succesfully removed for user " + user['telegramId']);
			}
			else{
				logger.warn("AvoidCtrl: User " + telegramId + " not found while trying to remove a avoid band");
			}

		}
	);

}

module.exports = {
	addAvoidBandForUser : addAvoidBandForUser,
	removeAvoidBandForUser : removeAvoidBandForUser
}