// import db schemas
var User = require('../db/user');

/// ---------- USER MANAGEMENT ---------- ///

exports.createUser = function(userName){

	// create new user
	var newUser = new User({
		name: userName
	});

	// Attempt to save the band into DB
	newUser.save(function(err, user) {
		if (err) throw err;
		console.log("[SERVER] User " + user['name'] + " succesfully created");
	});

}