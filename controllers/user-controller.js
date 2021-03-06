var User = require('../db/user');
var logger = require('../logger');

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
					botFsmState: "Welcome",
					nextBandToList: 0
				});

				// Attempt to save into DB
				newUser.save(function(err, user) {
					if (err) throw err;

					logger.debug("UserCtrl: User with telegramId " + user.telegramId + " succesfully created");

					mustBandsCntrl.computeSimToMustBandsForUser(telegramId);

					done(true);
				});

			}
			else{
				user.update({
					botFsmState: "Welcome"
				}, function(updated){
					logger.debug("UserCtrl: Reset botFsmState of user with telegramId " + telegramId);
					done(false);
				});
			}
		}
	)
}

exports.clearUser = function(telegramId, doneCallback){

	User.findOne(
		{
			telegramId: telegramId
		},
		function(err, user){
			if (err) throw err;
			
			if (!user){

				logger.warn("UserCtrl: User " + telegramId + " not found while trying to reset it");

			}
			else{
				user.update({
					telegramId: telegramId,
					mustBands: [],
					avoidBands: [],
					simToMust: {},
					schedule: {},
					upToDateSchedule: false,
					botFsmState: "Welcome",
					nextBandToList: 0
				}, function(updated){
					logger.debug("UserCtrl: Clear info of user with telegramId " + telegramId);
					doneCallback(false);
				});
			}
		}
	)
}

exports.listUsers = function(doneCallback){

	var listOfUsers = "";

	User.find({}, function (err, users) {
		if (err) throw err;

		if(users.length){
			for (u in users){
				listOfUsers += users[u].telegramFirstName + " " + users[u].telegramLastName + ": " + 
								"<i>m:" + users[u].mustBands.length + " | a:" + users[u].avoidBands.length + "</i>\n";
			}
			doneCallback(listOfUsers);
		}
	});
}
