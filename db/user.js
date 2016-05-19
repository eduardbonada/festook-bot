var mongoose = require('mongoose');

// Schema defines how the 'user' data will be stored in MongoDB
var UserSchema = new mongoose.Schema({
	
	name: {
		type: String,
		unique: true,
		required: true
	},

	// array of lowercase names 
	mustBands: {
		type: [String]
	},

	// Array that contains the value of similarity to must bands {"lowercase-name": "sim-value"}
	simToMust:{
		type: {}
	},	

	// Array that contains the object representation of the schedule
	schedule:{
		type: {}
	}	

});

// BandSchema.pre('save', function(next) {};

// BandSchema.methods.comparePassword = function(pw, cb) {

module.exports = mongoose.model('User', UserSchema);