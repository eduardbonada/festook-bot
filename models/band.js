var mongoose = require('mongoose');

// Schema defines how the 'band' data will be stored in MongoDB
var BandSchema = new mongoose.Schema({
	lowercase: {
		type: String,
		lowercase: true,
		unique: true,
		required: true
	},
	uppercase: {
		type: String,
		required: true
	},
	startTime: {
		type: String,
		required: true
	},
	endTime: {
		type: String,
		required: true
	},
	stage: {
		type: String,
		required: true
	},
	similarities:{
		type: Object
	}	
});

// BandSchema.pre('save', function(next) {};

// BandSchema.methods.comparePassword = function(pw, cb) {

module.exports = mongoose.model('Band', BandSchema);