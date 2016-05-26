// import db schemas
var User = require('../db/user');

var mustBandsCntrl = require('../controllers/mustBands-controller');


/// ---------- USER MANAGEMENT ---------- ///

exports.createUser = function(telegramId, telegramFirstName, telegramLastName, done){

	User.findOne(
		{
			telegramId: telegramId
		},
		function(err, user){
			if (err) throw err;
			
			if (!user){

				// create new user
				var newUser = new User({
					telegramId: telegramId,
					telegramFirstName: telegramFirstName,
					telegramLastName: telegramLastName,
					botFsmState: "Welcome"
				});

				// Attempt to save into DB
				newUser.save(function(err, user) {
					if (err) throw err;

					console.log("[USER] User with telegramId " + user.telegramId + " succesfully created");

					mustBandsCntrl.computeSimToMustBandsForUser(telegramId);

					done();
				});

			}
			else{
				user.update({
					botFsmState: "Welcome"
				}, function(updated){
					console.log("[USER] Reset of user with telegramId " + telegramId);
					done();
				});
			}
		}
	)
}