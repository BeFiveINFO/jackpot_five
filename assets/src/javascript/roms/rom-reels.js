/*
	Reels

	Reel Strips, symbols
*/

Gframe.rom.reels = {strips: {}}; // make "sound" / "files" directory

// Gframe.rom.reels.strips = [
// 	{"symbols":["orange","blank","bell","blank","prune","blank","orange","blank","prune","blank","bar","blank","orange","blank","prune","blank","orange","blank","seven","blank","cherry","blank"],"chances":[5,12,1,12,10,5,12,6,6,4,8,5,3,5,6,4,5,3,8,3,1,3],"totalChances":128,"totalStops":22}, // reel #1
// 	{"symbols":["orange","blank","bell","blank","prune","blank","orange","blank","prune","blank","bar","blank","orange","blank","prune","blank","orange","blank","seven","blank","cherry","blank"],"chances":[5,12,1,12,10,5,12,6,6,4,8,5,3,5,6,4,5,3,8,3,1,3],"totalChances":128,"totalStops":22}, // reel #2
// 	{"symbols":["orange","blank","bell","blank","prune","blank","orange","blank","prune","blank","bar","blank","orange","blank","prune","blank","orange","blank","seven","blank","cherry","blank"],"chances":[5,12,1,12,10,5,12,6,6,4,8,5,3,5,6,4,5,3,8,3,1,3],"totalChances":128,"totalStops":22}, // reel #3
// ];

// Gframe.rom.reels.strips = [
// 	{"symbols":["orange","blank","bell","blank","prune","blank","orange","blank","prune","blank","bar","blank","orange","blank","prune","blank","orange","blank","seven","blank","cherry","blank"],"chances":[5,2,3,1,10,2,14,2,14,4,10,5,8,4,12,2,14,3,9,1,1,1],"totalChances":128,"totalStops":22}, // reel #1
// 	{"symbols":["orange","blank","bell","blank","prune","blank","orange","blank","prune","blank","bar","blank","orange","blank","prune","blank","orange","blank","seven","blank","cherry","blank"],"chances":[5,2,3,1,10,2,14,2,14,4,10,5,8,4,12,2,14,3,9,1,1,1],"totalChances":128,"totalStops":22}, // reel #2
// 	{"symbols":["orange","blank","bell","blank","prune","blank","orange","blank","prune","blank","bar","blank","orange","blank","prune","blank","orange","blank","seven","blank","cherry","blank"],"chances":[5,2,3,1,10,2,14,2,14,4,10,5,8,4,12,2,14,3,9,1,1,1],"totalChances":128,"totalStops":22}, // reel #3
// ];

Gframe.rom.reels.strips = [
	{"symbols":["orange","blank","bell","blank","prune","blank","orange","blank","prune","blank","bar","blank","orange","blank","prune","blank","orange","blank","seven","blank","cherry","blank"],"chances":[4,2,10,1,10,2,12,2,8,4,15,5,8,4,13,2,10,3,9,1,1,1],"totalChances":128,"totalStops":22}, // reel #1
	{"symbols":["orange","blank","bell","blank","prune","blank","orange","blank","prune","blank","bar","blank","orange","blank","prune","blank","orange","blank","seven","blank","cherry","blank"],"chances":[4,2,10,1,10,2,12,2,8,4,15,5,8,4,13,2,10,3,9,1,1,1],"totalChances":128,"totalStops":22}, // reel #2
	{"symbols":["orange","blank","bell","blank","prune","blank","orange","blank","prune","blank","bar","blank","orange","blank","prune","blank","orange","blank","seven","blank","cherry","blank"],"chances":[4,2,10,1,10,2,12,2,8,4,15,5,8,4,13,2,10,3,9,1,1,1],"totalChances":128,"totalStops":22}, // reel #3
];

// The following is a sample code to convert a data set contained in object / array formatted in a rather understandable manner into a set of array compatible with backbone model.
/*
var testReelStrips_data = [[ // reel 1
	{symbol: "cherry", chances: 2},
	{symbol: "blank", chances: 5},
	{symbol: "orange", chances: 5},
	{symbol: "blank", chances: 3},
	{symbol: "bell", chances: 8},
	{symbol: "blank", chances: 5},
	{symbol: "orange", chances: 6},
	{symbol: "blank", chances: 6},
	{symbol: "cherry", chances: 2},
	{symbol: "blank", chances: 4},
	{symbol: "prune", chances: 7},
	{symbol: "blank", chances: 7},
	{symbol: "cherry", chances: 1},
	{symbol: "blank", chances: 6},
	{symbol: "prune", chances: 8},
	{symbol: "blank", chances: 6},
	{symbol: "orange", chances: 8},
	{symbol: "blank", chances: 7},
	{symbol: "bar", chances: 8},
	{symbol: "blank", chances: 11},
	{symbol: "seven", chances: 2},
	{symbol: "blank", chances: 11},
],]

var parseStripData = function (_stripsData) {
	// parsing Gframe.rom.reels.strips into Gframe.backbone.models.strip
	var _singleReelStripData;
	var _symbols;
	var _chances;
	var _totalChances;
	var _stripLength;
	for ( var _key in _stripsData ) {
		_singleReelStripData = _stripsData[_key];
		console.log(_singleReelStripData);
		_stripLength = _singleReelStripData.length;
		_symbols = [];
		_chances = [];
		_totalChances = 0;
		for ( var _i = 0; _i < _stripLength; _i ++ ) {
			//
			console.log(_singleReelStripData[_i].symbol);
			_symbols.push(_singleReelStripData[_i].symbol);
			_chances.push(_singleReelStripData[_i].chances);
			_totalChances = _totalChances + _singleReelStripData[_i].chances;
		}
		console.log(JSON.stringify({
		 	'symbols': _symbols,
		 	'chances': _chances,
		 	'totalChances': _totalChances,
		 	'totalStops': _stripLength
		 }));
	}
}

parseStripData(testReelStrips_data);
*/