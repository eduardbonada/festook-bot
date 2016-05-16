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

	// Array of {"lowercase-name": "sim-value"}
	simToMust:{
		type: {}
	}	

});

// BandSchema.pre('save', function(next) {};

// BandSchema.methods.comparePassword = function(pw, cb) {

module.exports = mongoose.model('User', UserSchema);