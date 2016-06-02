var moment = require('moment');

global.logLevels = {trace: 0, debug: 1, info: 2, warn: 3, error: 4, fatal: 5};

var trace = function (logMessage){
	if(global.logLevel <= global.logLevels.trace) console.log( moment().format('HH:mm:ss DD-MM-YYYY') + " TRACE " + logMessage ) ;
};

var debug = function (logMessage){
	if(global.logLevel <= global.logLevels.debug) console.log( moment().format('HH:mm:ss DD-MM-YYYY') + " DEBUG " + logMessage );
};

var info = function (logMessage){
	if(global.logLevel <= global.logLevels.info) console.log( moment().format('HH:mm:ss DD-MM-YYYY') + " INFO  " + logMessage );
};

var warn = function (logMessage){
	if(global.logLevel <= global.logLevels.warn) console.log( moment().format('HH:mm:ss DD-MM-YYYY') + " WARN  " + logMessage );
};

var error = function (logMessage){
	if(global.logLevel <= global.logLevels.error) console.log( moment().format('HH:mm:ss DD-MM-YYYY') + " ERROR " + logMessage );
};

var fatal = function (logMessage){
	if(global.logLevel <= global.logLevels.fatal) console.log( moment().format('HH:mm:ss DD-MM-YYYY') + " FATAL " + logMessage );
};


module.exports = {
	trace : trace,
	debug : debug,
	info : info,
	warn : warn,
	error : error,
	fatal : fatal
}