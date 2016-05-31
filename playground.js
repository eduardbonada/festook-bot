var bands = JSON.parse(require('fs').readFileSync('./festivals-info/ps2016_listBands.txt', 'utf8'));
var numBands = Object.keys(bands).length;

for (bandName in bands){
	console.log(bands[bandName].uppercaseName + "\t" + bands[bandName].lowercaseName);
}



