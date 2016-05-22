var mongoose = require('mongoose');

// Schema defines how the 'user' data will be stored in MongoDB
var UserSchema = new mongoose.Schema({

	telegramId: {
		type: String,
		unique: true,
		required: true
	},

	telegramFirstName: {
		type: String,
		required: true
	},

	telegramLastName: {
		type: String,
		required: true
	},
	
	// array of lowercase names 
	mustBands: {
		type: []
	},

	// array of lowercase names 
	avoidBands: {
		type: []
	},

	// Array that contains the value of similarity to must bands {"lowercase-name": "sim-value"}
	simToMust:{
		type: {}
	},	

	// Array that contains the object representation of the schedule
	schedule:{
		type: {}
	},

	// whether the schedule has to be recomputed or not
	upToDateSchedule:{
		type: Boolean
	}

});

module.exports = mongoose.model('User', UserSchema);