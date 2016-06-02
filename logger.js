var colors = require('colors');
var moment = require('moment');

global.logLevels = {trace: 0, debug: 1, info: 2, warn: 3, error: 4, fatal: 5};
global.logLevel = global.logLevels.info;

var trace = function (logMessage){
	console.log( ( moment().format('HH:mm:ss DD-MM-YYYY') + " TRACE " + logMessage ).grey ) ;
};

var debug = function (logMessage){
	console.log( ( moment().format('HH:mm:ss DD-MM-YYYY') + " DEBUG " + logMessage ).grey );
};

var info = function (logMessage){
	console.log( ( moment().format('HH:mm:ss DD-MM-YYYY') + " INFO  " + logMessage ).white );
};

var warn = function (logMessage){
	console.log( ( moment().format('HH:mm:ss DD-MM-YYYY') + " WARN  " + logMessage ).yellow );
};

var error = function (logMessage){
	console.log( ( moment().format('HH:mm:ss DD-MM-YYYY') + " ERROR " + logMessage ).red );
};

var fatal = function (logMessage){
	console.log( ( moment().format('HH:mm:ss DD-MM-YYYY') + " FATAL " + logMessage ).red );
};


module.exports = {
	trace : trace,
	debug : debug,
	info : info,
	warn : warn,
	error : error,
	fatal : fatal
}