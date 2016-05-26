var config = require('../config');

// Import JS State MAchine Library
var StateMachine = require("../libs/state-machine.js") // https://github.com/jakesgordon/javascript-state-machine

// Import db
var User = require('../db/user');

var backToTheFutureSentences = [
	"Roads? Where we're going, we don't need roads.",
	"Great Scott!",
	"1.21 gigawatts?! 1.21 gigawatts?! Great Scott!",
	"If my calculations are correct, when this baby hits eighty-eight miles per hour...",
	"Next Saturday night, we're sending you back to the future!",
	"This is heavy.",
	"Why do you keep calling me Calvin?",
	"Are you telling me that you built a time machine... out of a DeLorean?", 
	"Chuck. Chuck. It's Marvin - your cousin, Marvin BERRY. You know that new sound you're looking for? Well, listen to this." 
];

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
            	var message = "Hi " + user.telegramFirstName + "!\n\nThis is Festook and I am here to help you plan your schedule for " + config.festivalInfo.name + ".\n\nLet me explain you how this works:\n - First you tell me which bands you must see.\n- Then you sit back while I build up your schedule.\n\nGot it?";

				sendOutgoingMessage(message);

				//trigger event WelcomeToTripInfoDestination
				var fsm = this;
				setTimeout(function() {
					fsm.WelcomeDone();
				}, 1000);
			},

			onSaidYes: function(event, from, to) {
				message = "Cool!\n\nNow add your favourite bands typing /addMust. Easy peasy!\n\nWhen you are done type /schedule to see the magic.\n\nAnd remember that you can always type /help if you get lost.";
				sendOutgoingMessage(message);
				this.SaidYesToWaitCommand();
			},

			onFirstNo: function(event, from, to) {
				var message = "Come on, it is not that difficult...\n- First you tell me which bands you must see.\n- Then you sit back while I build up your schedule.\n\nGot it?";
				sendOutgoingMessage(message);
			},

			onSecondNo: function(event, from, to) {
				var message = "Are you kidding me?\n- First you tell me which bands you must see.\n- Then you sit back while I build up your schedule.\n\nGot it?";
				sendOutgoingMessage(message);
			},

			onThirdNo: function(event, from, to) {
				var message = "Argof**kyourself!\n\nWant to add a MUST band? Type /addMust. \nWant the schedule? Type /schedule.";
				sendOutgoingMessage(message);
			},

			onUnknownAnswer: function(event, from, to) {
				sendOutgoingMessage("I did not understand");
			},

			onAsyncMessage: function(event, from, to) {
				// send message with random answer
				var sentence = backToTheFutureSentences[Math.floor(Math.random()*backToTheFutureSentences.length)];
				setTimeout(function() {
					sendOutgoingMessage(sentence);
				}, 1000);
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
						fsm.AsyncMessage();
					}

				default: break;
			}
		}
	});
}

function isYes(message){
	var validYes = ["yes"];
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