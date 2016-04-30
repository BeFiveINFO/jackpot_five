/*
	sound rom
*/

Gframe.rom.sound = {files: {}}; // make "sound" / "files" directory

/*
	this rom is used to create Gframe.backbone.models.soundFile
	use format of objects in an array

	// id is mandatory.
	'src': '', // URL relative to that of sound file on server
	/*
		example:
		{
			'loop': 0, // set -1 for infinitely looping the sound
			'volume': 1,
			'startTime': 0, // startTime requires duration to be set
			'duration': null,
		}
	'PlayPropsConfig': {}, // define object of the parameters in rom as necessary
	savePosition: false, // bool play resumed from the previously stopped position
*/
Gframe.rom.sound.files = [
	{'id': 'bet_1','src': 'assets/sound/bet_1.ogg'},
	{'id': 'bet_2','src': 'assets/sound/bet_2.ogg'},
	{'id': 'bet_3','src': 'assets/sound/bet_3.ogg'},
	{'id': 'payout_1','src': 'assets/sound/payout_1.ogg'},
	{'id': 'payout_2','src': 'assets/sound/payout_2.ogg'},
	{'id': 'payout_3','src': 'assets/sound/payout_3.ogg','PlayPropsConfig':{'loop':-1}},
	{'id': 'payout_4','src': 'assets/sound/payout_4.ogg','PlayPropsConfig':{'loop':-1}},
	{'id': 'big_payout','src': 'assets/sound/big_payout.ogg','PlayPropsConfig':{'loop':-1}},
	{'id': 'handpay_bell','src': 'assets/sound/handpay_bell.ogg'},
	{'id': 'reel_spin_1_a','src': 'assets/sound/reel_spin_1_a.ogg','PlayPropsConfig':{'loop':-1},'savePosition': true},
	{'id': 'reel_spin_1_b','src': 'assets/sound/reel_spin_1_b.ogg','PlayPropsConfig':{'loop':-1},'savePosition': true},
	{'id': 'reel_spin_1_c','src': 'assets/sound/reel_spin_1_c.ogg','PlayPropsConfig':{'loop':-1},'savePosition': true},
	{'id': 'reel_spin_1_d','src': 'assets/sound/reel_spin_1_d.ogg','PlayPropsConfig':{'loop':-1},'savePosition': true},
	{'id': 'reel_spin_2_a','src': 'assets/sound/reel_spin_2_a.ogg','PlayPropsConfig':{'loop':-1},'savePosition': true},
	{'id': 'reel_spin_2_b','src': 'assets/sound/reel_spin_2_b.ogg','PlayPropsConfig':{'loop':-1},'savePosition': true},
	{'id': 'reel_spin_2_c','src': 'assets/sound/reel_spin_2_c.ogg','PlayPropsConfig':{'loop':-1},'savePosition': true},
	{'id': 'reel_spin_2_d','src': 'assets/sound/reel_spin_2_d.ogg','PlayPropsConfig':{'loop':-1},'savePosition': true},
	{'id': 'reel_spin_3','src': 'assets/sound/reel_spin_3.ogg','PlayPropsConfig':{'loop':-1},'savePosition': true},
	{'id': 'step_stop_1','src': 'assets/sound/step_stop_1.ogg'},
	{'id': 'step_stop_2','src': 'assets/sound/step_stop_2.ogg'},
	{'id': 'step_stop_3','src': 'assets/sound/step_stop_3.ogg'},
];

