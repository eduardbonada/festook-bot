// import db schemas
var User = require('../db/user');

var mustBandsCntrl = require('../controllers/mustBands-controller');


/// ---------- USER MANAGEMENT ---------- ///

exports.createUser = function(telegramId, telegramFirstName, telegramLastName){

	User.find(
		{
			telegramId: telegramId
		},
		function(err, user){
			if (err) throw err;
			
			if ( !user.length ){

				// create new user
				var newUser = new User({
					telegramId: telegramId,
					telegramFirstName: telegramFirstName,
					telegramLastName: telegramLastName
				});

				// Attempt to save the band into DB
				newUser.save(function(err, user) {
					if (err) throw err;
					console.log("[SERVER] User with telegramId " + user['telegramId'] + " succesfully created");

					mustBandsCntrl.computeSimToMustBandsForUser(telegramId);
				});

			}
		}
	)
}