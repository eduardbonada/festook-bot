/// ---------- LOAD DEPENDECIES ---------- ///

//var express  	= require('express');
//var app 	 	= express();
var mongoose 	= require('mongoose');

var config = require('./config');

/// ---------- CONNECT TO DATABASE ---------- ///

mongoose.connect(config.database, function(err) {
	if (err) throw err;
	console.log("Connected to DB");
});

/// ---------- SERVER CONFIGURATION ---------- ///

// set listening port
// var PORT = process.env.PORT || 3000;

// home route
// app.get('/', function(req, res) {
// 	res.send('Hello! The API is at http://localhost:' + PORT + '/');
// });

/// ---------- START UP SERVER ---------- ///

// app.listen(PORT, function() {
// 	console.log('Server listening on port ' + PORT);
// });

