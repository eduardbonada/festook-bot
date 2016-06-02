
// Import JS State MAchine Library
var StateMachine = require("../libs/state-machine.js") // https://github.com/jakesgordon/javascript-state-machine

// Import modules
var config = require('../config');
var User = require('../db/user');
var botReplier = require('./botReplier');
var logger = require('../logger');

function setupFsm(user, initialState, sendOutgoingMessage){

	logger.debug("BotFsm: Setup FSM of " + user.telegramId + " to state " + initialState);

	return StateMachine.create({
		initial: initialState,
		events: [
			{ name: 'WelcomeDone',  from: 'Welcome',  to: 'WaitFirstMustBand' },
			{ name: 'FirstMustBandProvided',  from: 'WaitFirstMustBand',  to: 'WaitFirstSchedule' },
			{ name: 'FirstScheduleAsked',  from: 'WaitFirstSchedule',  to: 'WaitCommand' },

			{ name: 'UnknownBand', from: 'WaitFirstMustBand',  to: 'WaitFirstMustBand' },
			{ name: 'UnknownScheduleDay', from: 'WaitFirstSchedule',  to: 'WaitFirstSchedule' },

			{ name: 'AsyncMessage',  from: 'WaitFirstMustBand', to: 'WaitFirstMustBand' },
			{ name: 'AsyncMessage',  from: 'WaitFirstSchedule', to: 'WaitFirstSchedule' },
			{ name: 'AsyncMessage',  from: 'WaitCommand', to: 'WaitCommand' }

			// { name: 'FirstYes',  from: 'WaitYes', to: 'SaidYes' },
			// { name: 'FirstNo',  from: 'WaitYes', to: 'WaitYesAfter1stNo' },

			// { name: 'YesAfter1stNo',  from: 'WaitYesAfter1stNo', to: 'SaidYes' },
			// { name: 'SecondNo',  from: 'WaitYesAfter1stNo', to: 'WaitYesAfter2ndNo' },

			// { name: 'YesAfter2ndNo',  from: 'WaitYesAfter2ndNo', to: 'SaidYes' },
			// { name: 'ThirdNo',  from: 'WaitYesAfter2ndNo', to: 'WaitCommand' },

			// { name: 'SaidYesToWaitCommand',  from: 'SaidYes', to: 'WaitCommand' },

			// { name: 'UnknownAnswer',  from: 'WaitYes', to: 'WaitYes' },
			// { name: 'UnknownAnswer',  from: 'WaitYesAfter1stNo', to: 'WaitYesAfter1stNo' },
			// { name: 'UnknownAnswer',  from: 'WaitYesAfter2ndNo', to: 'WaitYesAfter2ndNo' },
			],
		callbacks: {

            onWelcome: function(event, from, to) {                 
            	// var message = "Hi " + user.telegramFirstName + "!\n\n" + 
            	// 	"This is Festook and I am here to help you plan your schedule for " + config.festivalInfo.name + ".\n\n" + 
            	// 	"Let me explain you how this works:\n"+
            	// 	" - First you tell me which bands you must see.\n"+
            	// 	"- Then you sit back while I build up your schedule.\n\n"+
            	// 	"Got it?";

          	 	var message = "Hi " + user.telegramFirstName + "!\n\n" + 
            		"This is Festook and I am here to help you plan your schedule for " + config.festivalInfo.name + ".\n\n" + 
            		"First of all I need to know at least one band that you MUST see. Type /addmust and tell me.\n\n" + 
            		"Btw, tap into any highlighted command starting with a '/' and avoid typing it :)";

				sendOutgoingMessage(message);

				//trigger event WelcomeDone
				var fsm = this;
				setTimeout(function() {
					fsm.WelcomeDone();
				}, 1000);
			},

			onFirstMustBandProvided: function(event, from, to) {   
				message = "Nice! I like them too!\n" +
							"Let's see the real magic now! Type /schedule and you I'll craft the perfect plan for you :)";
				sendOutgoingMessage(message);
			},

			onUnknownBand: function(event, from, to) {   
				message = "Are you sure they play?\n" + 
							"Check out the list of /bands and type /addmust again.";
				sendOutgoingMessage(message);
			},

			onFirstScheduleAsked: function(event, from, to) {
				message = "That was easy, right?\n" + 
							"Now type /help and explore everything I can do...\n" + 
							"I'm here to assist! :)";

				sendOutgoingMessage(message);
			},

			onUnknownScheduleDay: function(event, from, to) {   
				message = "Wrong day!\n" + 
							"Type /schedule and try again";
				sendOutgoingMessage(message);
			},

			onAsyncMessage: function(event, from, to, message) {
				console.log(message);
				if(from == "WaitFirstMustBand"){
					message = "If you want me to help I need to know one band you MUST see.\nType /addmust and tell me...";
					sendOutgoingMessage(message);
				}
				if(from == "WaitFirstSchedule"){
					message = "Don't you want to know the plan I prepared for you?\nType /schedule to see it!";
					sendOutgoingMessage(message);
				}
				else if(from == "WaitCommand"){
					sendOutgoingMessage(botReplier.toAsyncComment(message));				
				}
			},

			onafterevent: function(event, from, to) { // fired after all events
				updateFsmStateToDB(user, this.current);
			}

			// onSaidYes: function(event, from, to) {
			// 	message = "Cool!\n\n"+
			// 		"Now add your favourite bands typing /addmust.\n\n"+
			// 		"If you have no idea, check all playing /bands.\n\n"+
			// 		"When you are done type /schedule to see the magic.\n\n"+
			// 		"And remember that you can always type /help if you get lost.\n\n" +
			// 		"Btw, tap into any highlighted command starting with a '/' and avoid typing it :).";
			// 	sendOutgoingMessage(message);
			// 	this.SaidYesToWaitCommand();
			// },

			// onFirstNo: function(event, from, to) {
			// 	var message = "Come on, it is not that difficult...\n"+
			// 		"- First you tell me which bands you must see.\n"+
			// 		"- Then you sit back while I build up your schedule.\n\n"+
			// 		"Got it?";
			// 	sendOutgoingMessage(message);
			// },

			// onSecondNo: function(event, from, to) {
			// 	var message = "Are you kidding me?\n"+
			// 		"- First you tell me which bands you must see.\n"+
			// 		"- Then you sit back while I build up your schedule.\n\n"+
			// 		"Got it?";
			// 	sendOutgoingMessage(message);
			// },

			// onThirdNo: function(event, from, to) {
			// 	var message = "That's enough!\n\n"+
			// 		"Want to add a MUST band? Type /addmust. \n"+
			// 		"Want the schedule? Type /schedule.";
			// 	sendOutgoingMessage(message);
			// },

			// onUnknownAnswer: function(event, from, to) {
			// 	if(from == "WaitYes" || from == "WaitYesAfter1stNo"  || from == "WaitYesAfter2ndNo" ){
			// 		sendOutgoingMessage(botReplier.toUnknownAnswer() + " Yes or no?");
			// 	}
			// },

		}
	});
}

var wakeUpBot = function(userId, message, outgoingMessageCallback){

	User.findOne({ telegramId: userId }, function(err, user){
		if (err) throw err;

		if(user){
			var state = user.botFsmState;
			var fsm = setupFsm(user, state, outgoingMessageCallback);

			switch(state){
				case "Welcome": break;

				case "WaitFirstMustBand":
					if(message === "MustBandNotProvidedYet"){
						fsm.UnknownBand();
					}
					else if(message === "MustBandProvided"){
						fsm.FirstMustBandProvided();
					}
					else {
						fsm.AsyncMessage(message);						
					}
					break;

				case "WaitFirstSchedule":
					if(message === "ScheduleNotRequestedYet"){
						fsm.UnknownScheduleDay();
					}
					else if(message === "ScheduleRequested"){
						fsm.FirstScheduleAsked();
					}
					else {
						fsm.AsyncMessage(message);						
					}
					break;

				case "WaitCommand":
					if( fsm.can("AsyncMessage") ){
						fsm.AsyncMessage(message);
					}
					break;

				// case "WaitYes":
				// 	if( isYes(message) && fsm.can("FirstYes") ){
				// 		fsm.FirstYes();
				// 	}
				// 	else if ( isNo(message) && fsm.can("FirstNo") ){
				// 		fsm.FirstNo();
				// 	}
				// 	else if( fsm.can("UnknownAnswer") ){
				// 		fsm.UnknownAnswer();
				// 	}
				// 	break;

				// case "WaitYesAfter1stNo":
				// 	if( isYes(message) && fsm.can("YesAfter1stNo") ){
				// 		fsm.YesAfter1stNo();
				// 	}
				// 	else if ( isNo(message) && fsm.can("SecondNo") ){
				// 		fsm.SecondNo();
				// 	}
				// 	else if( fsm.can("UnknownAnswer") ){
				// 		fsm.UnknownAnswer();
				// 	}
				// 	break;

				// case "WaitYesAfter2ndNo":
				// 	if( isYes(message) && fsm.can("YesAfter2ndNo") ){
				// 		fsm.YesAfter2ndNo();
				// 	}
				// 	else if ( isNo(message) && fsm.can("ThirdNo") ){
				// 		fsm.ThirdNo();
				// 	}
				// 	else if( fsm.can("UnknownAnswer") ){
				// 		fsm.UnknownAnswer();
				// 	}
				// 	break;

				default: break;
			}
		}
	});
}

function isYes(message){
	var validYes = ["yes", "sure", "ok"];
	return ( validYes.indexOf(message.toLowerCase()) >= 0 );	
}

function isNo(message){
	var validNo = ["no"];
	return ( validNo.indexOf(message.toLowerCase()) >= 0 );
}

function updateFsmStateToDB(user, state){
	User.update({ telegramId: user.telegramId }, {
		botFsmState : state
	}, function(err, numberAffected, rawResponse) {
		if (err){ 
			logger.error('BotFsm: Could not update botFsmState of user ' + user.telegramId + ' to ' + state);
		};
		logger.debug('BotFsm: Updated botFsmState of user ' + user.telegramId + ' to ' + state);
	})
}

module.exports = {
	wakeUpBot : wakeUpBot,
}