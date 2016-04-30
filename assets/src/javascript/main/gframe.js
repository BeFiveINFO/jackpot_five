/*
	gframe.js

	Welcome to the G-frame - a framework designed to bring wealth

	Since 2013
	2013 FEB		Tokyo (initial release)
	2013 APR-JUNE	Le Lot, France
	2014 MAY-JULY	Lisbon, Portugal

	Load Gframs.js before anything else as this file contains the most essential objects that other files require.

	gframe.js is not a framework any longer, this file serves as a file to take care of game initializtion and execution of logics in the main.js. after all the required files are loaded.

	External Libs Required:

		create JS and sound JS

*/

/*
	backbone event mediator
*/
if(!Backbone.mediator) Backbone.mediator = _.extend({}, Backbone.Events);

// This is the parent of the "G" world
var Gframe = {
	/* Gframe variables */
	'compatibility': null, // objects for storing compatibility check up
	'preloadManifest': [], // this is for the preloader (found in memory.js)
	/* backbone related */
	'backbone': { // for storing backbone objects
		'models': {},
		'collections': {},
		'views': {},
	},
	/* instances */
	'bootStatus': null, // instance of Gframe.backbone.models.bootStatus
	'clock': {},
	'segment': {},
	'reels': {},
	'audio': {},
	'vfx': {},
	'memory': {}, // for the backbone views holding game data. initiated upon document ready in the Gframe Boot loader below.
	'functions': {}, // for misc functions necessary for running the game
	'rom': {},
};

/*
	UTILS functions for gframe

	registerEvents
*/
Gframe.functions.utils = {
	/*
		Events
	*/
	registerMediatorEvents: function ( _object ) {
		if(!_object || typeof _object.triggerFunctions  == 'undefined') return false;
		for ( var _key in _object.triggerFunctions ) {
			Backbone.mediator.on(_object.triggerFunctions[_key], _object[_object.triggerFunctions[_key]], _object);
		}
	},
	/*
		RNG - Random Number Generator
	*/
	RNG: function ( _range ) {
		return ~~(Math.random()*(_range));
	},
	/*
		other stat tools for debugging
	*/
	findAverage: function (_data) {
		var sum = 0;
		for (var i=0; i<_data.length; i++) {
			sum = sum + _data[i];
		}
		return (sum / _data.length);
	},
	/*
		Find variance = sum of data - average ^ 2  / # of samples
	*/
	findVariance: function (_data) {
		// find average
		var ave = this.findAverage(_data);

		var varia = 0;
		for (var i=0; i<_data.length; i++) {
			varia = varia + Math.pow(_data[i] - ave, 2);
		}
		return (varia / _data.length);
	},
	/*
		find standard diviasion
	*/
	findStandardDeviation: function  (_data) {
		var varia = this.findVariance(_data);
	    return Math.sqrt(varia);
	},
	floatRound: function ( _number ) {
		return Math.ceil( _number * 10000 ) / 10000 ;
	}
}

// compatibility list
Gframe.compatibility = {
	'audio': false, // to get the primitive value result, use "Boolean(Gframe.compatibility.audio)"
	'cssanimations': false,
	'touch': false
};

/*
	Gframe Boot loader
*/
$(function() {
	"use strict";
	/*
		init
	*/
	Gframe.bootStatus = new Gframe.backbone.models.bootStatus({el:'#console'});
	Gframe.bootStatus.set('rom', true);
	Gframe.memory = new Gframe.backbone.views.memory({collection: new Gframe.backbone.collections.memory});
	Gframe.clock = new Gframe.backbone.views.clock({collection: new Gframe.backbone.collections.clocks});
	Gframe.segment = new Gframe.backbone.views.segment({collection: new Gframe.backbone.collections.segments});
	Gframe.audio = new Gframe.backbone.views.audio({collection: new Gframe.backbone.collections.soundFiles(Gframe.rom.sound.files)});
	Gframe.reels = new Gframe.backbone.views.reels({collection: new Gframe.backbone.collections.strips(Gframe.rom.reels.strips)});
	Gframe.vfx = new Gframe.backbone.views.vfx({el:'#vfx-container', collection: new Gframe.backbone.collections.vfx(Gframe.rom.vfx)});
	Gframe.functions.preload();


	/*{
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
*/
	// vfx_manager.init('#vfx-container');
	// $('.marquee, .frontface-plate').css('opacity',0);
	// setStepperAngles('#reel-1');
	// setStepperAngles('#reel-2');
	// setStepperAngles('#reel-3');
	// // reel strips
	// setReelStrips('#reel-1',_reelStrips.a);
	// setReelStrips('#reel-2',_reelStrips.b);
	// setReelStrips('#reel-3',_reelStrips.c);

});