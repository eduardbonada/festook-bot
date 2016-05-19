
var config = require('../config');

// import controllers
var userCntrl = require('../controllers/user-controller');
var mustBandsCntrl = require('../controllers/mustBands-controller');
var scheduleCntrl = require('../controllers/schedule-controller');

// import db schemas
var User = require('../db/user');
var Band = require('../db/band');

// Setup Telegram connection
var TelegramBot = require('node-telegram-bot-api');
var options = { polling: true };
var bot = new TelegramBot(config.telegramBotToken, options);

bot.getMe().then(function (me) {
	console.log('[BOT] %s is ready!', me.username);
});

// Matches /start
bot.onText(/\/start/, function (msg, match) {

	var telegramId = msg.from.id;
	var telegramFirstName = msg.from.first_name;
	var telegramLastName = msg.from.last_name;
	
	console.log('[BOT] New user connected: ' + telegramId + ' - ' + telegramFirstName + ' ' + telegramLastName);

	userCntrl.createUser(telegramId, telegramFirstName, telegramLastName);

	bot.sendMessage(msg.chat.id, 'Hi ' + telegramFirstName + '! Let\'s build your schedule for the festival!')
	.then(function () {
		bot.sendMessage(msg.chat.id, 'This is the list of commands you can use. \n\
			/allBands: Explanation ...\n\
			/mustBands: Explanation ...\n\
			/addMustBand: Explanation ...\n\
			/removeMustBand: Explanation ...\n\
			/schedule: Explanation ...\n\
			I recommend you start with \'/addMustBand\'')
	});
});

// Matches /allBands
bot.onText(/\/allBands/, function (msg, match) {

	var telegramId = msg.from.id;

	console.log('[BOT] User ' + telegramId + ' wants the list of bands');

	User.findOne(
		{
			telegramId: telegramId
		}, 
		function(err, user){
			if (err) throw err;

			// get bands info
			Band.find({}, function (err, bands) {
					if (err) throw err;

					var bandsInfo = {};
					for(b in bands){
						bandsInfo[bands[b].lowercase] = bands[b];
					}

					var listBandsMessage = "";

					if(!user.simToMust){ // if no similarities yet, print the list of all bands in festival
						listBandsMessage += "These are all the bands playing: \n\n";
						for (b in bandsInfo){
							listBandsMessage += bandsInfo[b].uppercase + ', ';
						}
						listBandsMessage = listBandsMessage.slice(0, -2); // remove last ', '						
					}
					else{ // if similarities set, print the list of bands sorted by similarity
						listBandsMessage += "These are all the bands playing sorted according to your taste: \n\n";
						var sortedBandNames = getSortedKeys(user.simToMust, "descending");
						for (b in sortedBandNames){
							listBandsMessage += bandsInfo[sortedBandNames[b]].uppercase + ', ';
						}
						listBandsMessage = listBandsMessage.slice(0, -2); // remove last ', '
					}
					listBandsMessage += "\n\nDid you chose your /mustBands already";

					bot.sendMessage(msg.chat.id, listBandsMessage)
					.then(function () {});

				});

		});

});

// Matches /mustBands
bot.onText(/\/mustBands/, function (msg, match) {

	var telegramId = msg.from.id;

	console.log('[BOT] User ' + telegramId + ' listing Must bands');

	User.findOne(
		{
			telegramId: telegramId
		},
		function(err, user){
			if (err) throw err;

			if(!user.mustBands.length){ // if there are no must bands
				console.log('[BOT] User ' + telegramId + ' has not introduced any must band yet');
				bot.sendMessage(msg.chat.id, 'You have not added any \'must band\' (those that you don\'t want to miss). Do it with /addMustBand.')
				.then(function () {});
			}
			else{ // if there are must bands
				
				// get bands info
				Band.find({},function(err, bands){

					if (err) throw err;

					var bandsInfo = {};
					for(b in bands){
						bandsInfo[bands[b].lowercase] = bands[b];
					}

					var messageMustBands = "Your must bands are:\n\n";
					for(b in user.mustBands){
						messageMustBands += "- " + bandsInfo[user.mustBands[b]].uppercase + "\n";
					}
					messageMustBands += "\nEdit them with /addMustBand or /removeMustBand.";

					bot.sendMessage(msg.chat.id, messageMustBands)
					.then(function () {});
	
					console.log('[BOT] User ' + telegramId + ' has introduced ' + user.mustBands.length + ' bands');
					
				});
			}
		});

});

// Matches /addMustBand
bot.onText(/\/addMustBand/, function (msg, match) {

	var telegramId = msg.from.id;

	console.log('[BOT] User ' + telegramId + ' wants to add a must band');

	bot.sendMessage(
		msg.chat.id,
		'Which is the name of a band you don\'t want to miss?',
		{
			reply_markup: JSON.stringify({force_reply: true})
		}
	)
	.then(function (sent) {
		bot.onReplyToMessage(sent.chat.id, sent.message_id, function (message) {

			var mustBandToAdd = message.text.toLowerCase().replace("&", "and").replace(/\s/g, '');

			console.log('[BOT] Trying to add must band ' + mustBandToAdd);

			// check if this must band does not exists
			User.findOne(
				{
					telegramId: telegramId
				},
				function(err, user){
					if (err) throw err;

					if(user.mustBands.indexOf(mustBandToAdd) != -1){

						bot.sendMessage(msg.chat.id, "You already marked '" + message.text + "' as a must band!")
						.then(function () {});

						console.log('[BOT] Band ' + mustBandToAdd + ' already in list of must bands');

					}
					else{

						// check if this must band exists
						Band.find(
							{
								lowercase : mustBandToAdd
							},
							function(err, band){
								if (err) throw err;

								if(band.length){

									mustBandsCntrl.addMustBandForUser(telegramId, mustBandToAdd);

									bot.sendMessage(msg.chat.id, "'" + band[0].uppercase + "' was added to your list of /mustBands!")
									.then(function () {});

									console.log('[BOT] User ' + telegramId + ' added must band: ' + mustBandToAdd);

								}
								else{

									bot.sendMessage(msg.chat.id, "I could not find the band '" + mustBandToAdd + "' :(")
									.then(function () {});

									console.log('[BOT] Band ' + mustBandToAdd + ' not found');

								}
							});
					}
				});
		});
	});
});


// Matches /removeMustBand
bot.onText(/\/removeMustBand/, function (msg, match) {

	var telegramId = msg.from.id;

	console.log('[BOT] User ' + telegramId + ' wants to remove a must band');

	bot.sendMessage(
		msg.chat.id,
		'Which is the name of a band you don\'t want to see?',
		{
			reply_markup: JSON.stringify({force_reply: true})
		}
	)
	.then(function (sent) {
		bot.onReplyToMessage(sent.chat.id, sent.message_id, function (message) {

			var mustBandToRemove = message.text.toLowerCase().replace("&", "and").replace(/\s/g, '');

			console.log('[BOT] Trying to remove must band ' + mustBandToRemove);

			// check if this must band exists
			User.findOne(
				{
					telegramId: telegramId
				},
				function(err, user){
					if (err) throw err;

					if(user.mustBands.indexOf(mustBandToRemove) != -1){

						mustBandsCntrl.removeMustBandForUser(telegramId, mustBandToRemove);

						bot.sendMessage(msg.chat.id, "'" + message.text + "' was removed from your list of /mustBands!")
						.then(function () {});

						console.log('[BOT] User ' + telegramId + ' removed must band: ' + mustBandToRemove);

					}
					else{

						bot.sendMessage(msg.chat.id, "I could not find the band '" + mustBandToRemove + "' :(")
						.then(function () {});

						console.log('[BOT] Band ' + mustBandToRemove + ' not found in must bands');

					}

				});

		});
	});
});

// Matches /schedule
bot.onText(/\/schedule/, function (msg, match) {

	var telegramId = msg.from.id;

	console.log('[BOT] User ' + telegramId + ' wants the schedule');

	bot.sendMessage(
		msg.chat.id,
		'Which day (dd/mm/yyyy)?',
		{
			reply_markup: JSON.stringify({force_reply: true})
		}
	)
	.then(function (sent) {
		bot.onReplyToMessage(sent.chat.id, sent.message_id, function (message) {

			var festivalDay = message.text;

			if(config.festivalInfo.days.indexOf(festivalDay)){ // if the day entered is one of the days of the festival

				scheduleCntrl.computeScheduleForDay(telegramId, festivalDay, function(textSchedule){
					var scheduleMessage = "This is your schedule for day " + festivalDay + ": \n\n";
					scheduleMessage += textSchedule;
					scheduleMessage += "\nEnjoy!";

					bot.sendMessage(msg.chat.id, scheduleMessage)
					.then(function () {});

					console.log('[BOT] User ' + telegramId + ' got the schedule for day ' + festivalDay);

				});

			}
			else{

				bot.sendMessage(msg.chat.id, "There is no festival in " + festivalDay + " :(")
				.then(function () {});

				console.log('[BOT] User ' + telegramId + ' entered a wrong festival day :'+ festivalDay);

			}

		});
	});

});



function getSortedKeys(obj, sortMethod) {
	// returns an array of sorted keys based on value and sortMethod

    var keys = []; 
    for(var key in obj) keys.push(key);

    if(sortMethod == "ascending"){
	    return keys.sort(function(a,b){ return obj[a]-obj[b]})
	}
	else if (sortMethod == "descending"){
	    return keys.sort(function(a,b){ return obj[b]-obj[a]}) 
	}
    	
}





/****************************************/


//bot.onText('message', function (msg) {
//});


//bot.onText(/\/echo (.+)/, function (msg, match) {
//});
	
// bot.onText(/^\/say_hello (.+)$/, function (msg, match) {
// var name = match[1];
// bot.sendMessage(msg.chat.id, 'Hello ' + name + '!').then(function () {
// // reply sent!
// });
// });

// bot.onText(/^\/sum((\s+\d+)+)$/, function (msg, match) {
// var result = 0;
// match[1].trim().split(/\s+/).forEach(function (i) {
// result += (+i || 0);
// })
// bot.sendMessage(msg.chat.id, result).then(function () {
// // reply sent!
// });
// });