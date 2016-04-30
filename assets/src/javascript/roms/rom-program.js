/*
	ROM

	This file has all the definitions to be set into respective backbone collections.

	This file has data for:
	- Reel strip
	- Pay table
*/

// segment

Gframe.rom.segment = [
	{
		'id': 'zero_credits',
		'el': '#free_games .segment_display.active',
		'template': "        PLAY FREE GAMES TO EARN CREDITS. ... GET <%= free_credit_awards %> FREE GAMES EVERY <%= free_credit_awards_time %>. KEEP UP TO <%= max_free_credit_awards %> FREE GAMES AT A TIME.",
		'variables': {
			'free_credit_awards': 20,
			'free_credit_awards_time': "30 MINUTES",
			'max_free_credit_awards': 99,
		},
		'frequency': 200,
		'scroll': true,
	},
];

var _currentRotationAngle = 0;
var _rotationAngle_max = 0;
var _rotationAngle_min = 0;
var _currentStep = 0;


	// updateDisplay_free_game: function () {
	// 	var $_free_game = $('#free_games .segment_display.active');
	// 	if(free_game_count <= 0) {
	// 		// add credits
	// 		free_game_count = 200;
	// 	}
	// 	//
	// 	var _string_to_show = addChars(formatTime(free_game_count),5,'&nbsp;', true) + '&nbsp;40' ;
	// 	$_free_game.html(_string_to_show);
	// 	free_game_count--;
	// },

