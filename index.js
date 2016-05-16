/// ---------- LOAD DEPENDECIES ---------- ///

//var express  	= require('express');
//var app 	 	= express();
var mongoose 	= require('mongoose');

var config = require('./config');

var User = require('./models/user');

/// ---------- CONNECT TO DATABASE ---------- ///

mongoose.connect(config.database, function(err) {
	if (err) throw err;
	console.log("Connected to DB");

	//createUser('test_user_2');

	//setMustBandsForUser('test_user_2', ['foex']);

	computeSimToMustBandsForUser('test_user_2');

});


/// ---------- USER MANAGEMENT ---------- ///

function createUser(userName){

	// create new user
	var newUser = new User({
		name: userName
	});

	// Attempt to save the band into DB
	newUser.save(function(err, user) {
		if (err) throw err;
		console.log("USER: User " + user['name'] + " succesfully created");
	});

}

function setMustBandsForUser(userName, mustBands){

	// Store users must bands into DB
	User.findOneAndUpdate(
		{ 
			name: userName
		}, 
		{
			$set: { 
				mustBands: mustBands
			}
		}, 
		function(err, user){
			if (err) throw err;
			console.log("USER: Must bands succesfully stored for user " + user['name']);
		}
	);

}

/// ---------- COMPUTE SIMILARITIES TO MUST BANDS ---------- ///

function computeSimToMustBandsForUser(userName){

	var simToMust = require('./simToMust')

	User.findOne(
		{
			name: userName
		},
		function(err, user){
			simToMust.computeBandSimilarityToMustBands(user);
		}
	);

}