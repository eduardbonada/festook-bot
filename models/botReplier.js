var asyncCommentPatterns = [

	{ 
		patterns  : ["fuck", "suck", "sex"], 
		sentences : [
			"Don't ever say that again!", 
			"Do I like you?",
			"I would prefer some flowers",
			"Just like honey"
			] 
	},
	{ 
		patterns  : ["great scott"], 
		sentences : [
			"Roads? Where we're going, we don't need roads.",
			"Great Scott!",
			"1.21 gigawatts?! 1.21 gigawatts?! Great Scott!",
			"If my calculations are correct, when this baby hits eighty-eight miles per hour...",
			"Next Saturday night, we're sending you back to the future!",
			"This is heavy.",
			"Why do you keep calling me Calvin?",
			"Are you telling me that you built a time machine... out of a DeLorean?", 
			"Chuck. Chuck. It's Marvin - your cousin, Marvin BERRY. You know that new sound you're looking for? Well, listen to this."
			] 
	},

	{
		patterns : ["schedule", "plan", "day", "today", "tomorrow", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
		sentences : ["To see your plan just type /schedule!"]
	},

	{
		patterns : ["must"],
		sentences : ["Do you want to see your /must bands?"]
	}

];

var asyncCommentRandom = [
	"You talkin' to me? Type /help and tell me what you need.",
	"What can I /help you with?",
	"What can I do for you? Type /help for some ideas.",
	"What do you need? /help?"
];

var unknownAnswerSentences = [
	"What?",
	"Mmmm... did't get that.",
	"We have a small communication problem here...", 
	"Let's leave this issue for later.",
	"That's not importnat now.",
	"I'm trying to help you here."
];

var replyToAsyncComment = function(msg){

	global.log.debug("BotReplier: Replies to async comment");

	var message = msg.toLowerCase();

	// check if patterns are found in the message string
	var replySentence = "";
	for(p in asyncCommentPatterns){
		if (message.match(new RegExp("(" + asyncCommentPatterns[p].patterns.join("|") + ")")) != null){
			var sentences = asyncCommentPatterns[p].sentences;
			return sentences[Math.floor(Math.random()*sentences.length)];
		}
	}

	// if no patterns found, return a random sentence
	return asyncCommentRandom[Math.floor(Math.random()*asyncCommentRandom.length)];
}


var replyToUnknownAnswer = function(message){
	global.log.debug("BotReplier: Replies to unknown answer");

	return unknownAnswerSentences[Math.floor(Math.random()*unknownAnswerSentences.length)];
}

module.exports = {
	toAsyncComment : replyToAsyncComment,
	toUnknownAnswer : replyToUnknownAnswer
}