
// Import JS State MAchine Library
var StateMachine = require("../libs/state-machine.js") // https://github.com/jakesgordon/javascript-state-machine

// Import modules
var config = require('../config');
var User = require('../db/user');
var botReplier = require('./botReplier');

function setupFsm(user, initialState, sendOutgoingMessage){

	console.log("[FSM] Setup FSM of " + user.telegramId + " to state " + initialState);

	return StateMachine.create({
		initial: initialState,
		events: [
			{ name: 'WelcomeDone',  from: 'Welcome',  to: 'WaitYes' },

			{ name: 'FirstYes',  from: 'WaitYes', to: 'SaidYes' },
			{ name: 'FirstNo',  from: 'WaitYes', to: 'WaitYesAfter1stNo' },

			{ name: 'YesAfter1stNo',  from: 'WaitYesAfter1stNo', to: 'SaidYes' },
			{ name: 'SecondNo',  from: 'WaitYesAfter1stNo', to: 'WaitYesAfter2ndNo' },

			{ name: 'YesAfter2ndNo',  from: 'WaitYesAfter2ndNo', to: 'SaidYes' },
			{ name: 'ThirdNo',  from: 'WaitYesAfter2ndNo', to: 'WaitCommand' },

			{ name: 'SaidYesToWaitCommand',  from: 'SaidYes', to: 'WaitCommand' },

			{ name: 'UnknownAnswer',  from: 'WaitYes', to: 'WaitYes' },
			{ name: 'UnknownAnswer',  from: 'WaitYesAfter1stNo', to: 'WaitYesAfter1stNo' },
			{ name: 'UnknownAnswer',  from: 'WaitYesAfter2ndNo', to: 'WaitYesAfter2ndNo' },

			{ name: 'AsyncMessage',  from: 'WaitCommand', to: 'WaitCommand' }
			],
		callbacks: {

            onWelcome: function(event, from, to) {                 
            	var message = "Hi " + user.telegramFirstName + "!\n\n" + 
            		"This is Festook and I am here to help you plan your schedule for " + config.festivalInfo.name + ".\n\n" + 
            		"Let me explain you how this works:\n"+
            		" - First you tell me which bands you must see.\n"+
            		"- Then you sit back while I build up your schedule.\n\n"+
            		"Got it?";

				sendOutgoingMessage(message);

				//trigger event WelcomeToTripInfoDestination
				var fsm = this;
				setTimeout(function() {
					fsm.WelcomeDone();
				}, 1000);
			},

			onSaidYes: function(event, from, to) {
				message = "Cool!\n\n"+
					"Now add your favourite bands typing /addmust. Easy peasy!\n\n"+
					"When you are done type /schedule to see the magic.\n\n"+
					"And remember that you can always type /help if you get lost.\n\n" +
					"Btw, tap into any highlighted command starting with a '/' and avoid typing it :).";
				sendOutgoingMessage(message);
				this.SaidYesToWaitCommand();
			},

			onFirstNo: function(event, from, to) {
				var message = "Come on, it is not that difficult...\n"+
					"- First you tell me which bands you must see.\n"+
					"- Then you sit back while I build up your schedule.\n\n"+
					"Got it?";
				sendOutgoingMessage(message);
			},

			onSecondNo: function(event, from, to) {
				var message = "Are you kidding me?\n"+
					"- First you tell me which bands you must see.\n"+
					"- Then you sit back while I build up your schedule.\n\n"+
					"Got it?";
				sendOutgoingMessage(message);
			},

			onThirdNo: function(event, from, to) {
				var message = "That's enough!\n\n"+
					"Want to add a MUST band? Type /addmust. \n"+
					"Want the schedule? Type /schedule.";
				sendOutgoingMessage(message);
			},

			onUnknownAnswer: function(event, from, to) {
				if(from == "WaitYes" || from == "WaitYesAfter1stNo"  || from == "WaitYesAfter2ndNo" ){
					sendOutgoingMessage(botReplier.toUnknownAnswer() + " Yes or no?");
				}
			},

			onAsyncMessage: function(event, from, to, message) {
				sendOutgoingMessage(botReplier.toAsyncComment(message));
			},

			onafterevent: function(event, from, to) { // fired after all events
				//console.log("onafterevent : " + event + " | " + from + "=>" + to);
				updateFsmStateToDB(user, this.current);
			}
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

				case "WaitYes":
					if( isYes(message) && fsm.can("FirstYes") ){
						fsm.FirstYes();
					}
					else if ( isNo(message) && fsm.can("FirstNo") ){
						fsm.FirstNo();
					}
					else if( fsm.can("UnknownAnswer") ){
						fsm.UnknownAnswer();
					}
					break;

				case "WaitYesAfter1stNo":
					if( isYes(message) && fsm.can("YesAfter1stNo") ){
						fsm.YesAfter1stNo();
					}
					else if ( isNo(message) && fsm.can("SecondNo") ){
						fsm.SecondNo();
					}
					else if( fsm.can("UnknownAnswer") ){
						fsm.UnknownAnswer();
					}
					break;

				case "WaitYesAfter2ndNo":
					if( isYes(message) && fsm.can("YesAfter2ndNo") ){
						fsm.YesAfter2ndNo();
					}
					else if ( isNo(message) && fsm.can("ThirdNo") ){
						fsm.ThirdNo();
					}
					else if( fsm.can("UnknownAnswer") ){
						fsm.UnknownAnswer();
					}
					break;

				case "WaitCommand":
					if( fsm.can("AsyncMessage") ){
						fsm.AsyncMessage(message);
					}

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
			console.error('[FSM] Could not update botFsmState of user ' + user.telegramId + ' to ' + state);
		};
		console.log('[FSM] Updated botFsmState of user ' + user.telegramId + ' to ' + state);
	})
}

module.exports = {
	wakeUpBot : wakeUpBot,
}