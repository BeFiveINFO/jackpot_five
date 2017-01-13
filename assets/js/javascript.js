/*
	javascript
*/

// welcome to the G-frame
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
};

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
// all the followings hold required routines for the G-Frame to work.
/*
	Audio

	Requires create JS and sound JS
*/

/*
	Sound file data model
*/
Gframe.backbone.models.soundFile = Backbone.Model.extend({
	'play_mode': 0,
	'PlayPropsConfig': null,
	'soundInstance': null,
	'savePosition': false,
	'currentPosition': 0,
	'duration': 0,
	defaults: function() {
		return {
			// id is mandatory.
			'src': '', // URL relative to that of sound file on server
			/*
				example:
				{
					'startTime': 0,
					'loop': 0, // set -1 for infinitely looping the sound
					'volume': 1,
					'duration': null,
				}
			*/
			'PlayPropsConfig': {}, // define object of the parameters in rom as necessary
			'savePosition': false,
		};
	},
	initialize: function() {
		this.play_mode = this.get('play_mode');
		this.savePosition = this.get('savePosition');
		// Gframe.functions.utils.registerMediatorEvents ( this );
	},
	resetSoundFileStartTime: function () {
		this.set('startTime',0);
	}
});

// collection for the sound files. This collection will be used to generate a soundJS manifest for pre-loading.
Gframe.backbone.collections.soundFiles = Backbone.Collection.extend({
	model: Gframe.backbone.models.soundFile
});

/*
	Important : Use of Backbone mediator event is encouraged when controlling audio elements through this View.
	Avoid direct access to this View
*/
Gframe.backbone.views.audio = Backbone.View.extend({
	'mute': false,
	'triggerFunctions': [
		'playSound',
		'stopSound',
		'muteSound',
	],
	initialize: function(options) {
		// detect audio availability
		if(!options.collection) {
			throw new Error('Fatal: Gframe.backbone.views.audio requires Gframe.backbone.collections.soundFiles passed in the argument.');
			return false;
		}
		// add sound file details to Gframe.preloadManifest only when the device supports HTML5 audio
		if( Boolean(Gframe.compatibility.audio) === true ) {
			this.collection.each(function(_soundFile_model) {
				Gframe.preloadManifest.push({'id':_soundFile_model.id,'src':_soundFile_model.get('src')});
			});
		}
		// register events
		Gframe.functions.utils.registerMediatorEvents ( this );
		// init soundJS config
		createjs.Sound.alternateExtensions = ['mp3'];
		// update bootStatus
		Gframe.bootStatus.set('audio', true);
	},
	playSound: function( _id ) {
		if( this.mute == true ) return false;
		var _model = this.collection.get(_id);

		if(!_model) {
			console.log('playSound() @ Gframe.backbone.views.audio: '+ _id + 'not found');
			return false;
		}
		if(!_model.soundInstance) {
			_model.soundInstance = createjs.Sound.createInstance( _model.id );
			_model.duration = _model.soundInstance.duration;
		}
		if(!_model.PlayPropsConfig) {
			_model.PlayPropsConfig = new createjs.PlayPropsConfig().set(_model.get('PlayPropsConfig'));
		}
		if(_model.savePosition == true) {
			var _playPosition = 0;
			/*
				currentPosition is set a stopSound().
				To be on the safe side it compares with the sound duration. Set to the same number as the duration
				if the current position is bigger than that.
			*/
			if(_model.currentPosition > _model.duration){
				_playPosition = _model.duration;
			} else {
				_playPosition = _model.currentPosition;
			}
			_model.soundInstance.setPosition(_playPosition);
		}
		_model.soundInstance.play(_model.PlayPropsConfig);
	},
	stopSound: function( _id ) {
		if(!_id) {
			createjs.Sound.stop();
		} else {
			var _model = this.collection.get(_id);
			if(!_model) {
				console.log('playSound() @ Gframe.backbone.views.audio: '+ _id + 'not found');
				return false;
			}
			var _soundInstance = _model.soundInstance;
			if(!_soundInstance) return false;
			if(_model.savePosition == true) {
				/*
				parseInt() is used to avoid problems caused by floating point numbers
				say, if the duration of the sound is 111111.012345 and the current position
				happened to be 111111.112345 (only 0.1 second longer than the actual sound duration) for
				whatever reason. Then it will stop playing any sound afterwards.
				*/
				_model.currentPosition = parseInt(_soundInstance.position);
			}
			_soundInstance.stop();
		}
	},
	muteSound: function ( _boolean ) {
		this.mute = (_boolean) ? _boolean : true ;
		if(this.mute == true) {
			this.stopSound();
		}
	},
});

/*
	New instance for the Audio created in Gframe.js (as it will try to avoid loading when unnecessary
	new Gframe.backbone.views.audio;
*//*
	Gframe initialization status model

	Note: The model has model and view functionality.

	1. compatibility
	2. go through circuits
	3. preload triggered
	4. preloadProgress while being loaded
	5. complete , Check OK or NG
	6. OK passed, then fire gamoMode

*/
Gframe.backbone.models.bootStatus = Backbone.Model.extend({
	$el: null,
	'triggerFunctions': [
		'preloadProgress',
		'gameMode',
		'errorMode',
	],
	'circuits': {
		'compatibility': false,
		'clock': false,
		'rom': false,
		'memory': false,
		'audio': false,
		'segment': false,
		'reels': false,
		// 'vfx': false,
		// 'preloadProgress': {},
		// 'preload': false,
	},
	defaults: function() {
		return $.extend({
			'complete': false,
			/* private. reserved by this model */
			'NG': false,
			'OK': false,
		},this.circuits);
	},
	initialize: function(options) {
		this.$el = $('#console');
		// register events
		Gframe.functions.utils.registerMediatorEvents ( this );
		this.on('change', this.updateStatus, this);
		// initiate boot check
		this.$el.append('<p>GFRAME VERSION 1.0 STARTUP TEST</p>');
		this.detectCompatibility();
	},
	updateStatus: function ( _event ){
		var _changed = _event.changed;
		var _afterComplete;
		// trigger
		for(_bootItem_id in _changed) {
			switch(_bootItem_id) {
				case 'OK':
					this.$el.append('<p>GFRAME is now ready to launch.</p>');
					Backbone.mediator.trigger( 'gameMode' );
					break;
				case 'NG':
					var _circuits_status = this.attributes;
					console.log('NG', _circuits_status);
					this.$el.append('<p>Error detected. Check the console.</p>');
					Backbone.mediator.trigger( 'errorMode');
					break;
				case 'complete':
					var _complete_flag = true;
					for ( var _key in this.circuits ) {
						if(this.get(_key) !== true) {
							_complete_flag = false;
						}
					}
					if(_complete_flag === true) {
						this.set('OK',true);
					} else {
						this.set('NG',true);
					}
					break;
				default:
					var _result = (this.get(_bootItem_id)) ? 'OK' : 'NG';
					this.$el.append('<p>'+_bootItem_id+' : '+_result+'</p>');
					break;
			}
		}
	},
	detectCompatibility: function () {
		if(typeof Gframe.compatibility == 'undefined' || !Gframe.compatibility) {
			throw new Error('Fatal: Gframe.compatibility not defined.');
			return false;
		}
		for( var _feature in Gframe.compatibility ) {
			Gframe.compatibility[_feature] = Modernizr[_feature];
		}
		if(navigator.userAgent.match(/Windows Phone/i) == true) {
			Gframe.compatibility.audio = false;
		}
		// detect touch devices:
		if(Gframe.compatibility.touch === true) {
			alert('touch');
			window.addEventListener('load', function() {
				FastClick.attach(document.getElementById('fastclick_area'));
			});
		}
		// update bootStatus
		this.set('compatibility', true);
	},
	/* events */
		/*	_segmentSettings = {
			'id': idnameofyourchoice,
			'template': '', // Default Message to show in the segment (underscore template format). This is used only when this is set. register as set below will be used as the _ template variable. If you are not using template in favor of register value, set blank.
			'register': '', // String (optional) name of memory register variable. It needs to be object if it is used for _ template. To show the register value as is, the value of register needs to be either string of number.
			'digits': 8, // digits of the segment display
			'clockSettings': {
				'id': null, // do not have to set the id when creating this model
				'loop': -1,
				'frequency': 200,
				'wait': true,
				timerFunction: function () {}
			}, // the settings to be sent to clock,
		}
		*/
	gameMode: function () {
		var _self = this;
		$('#console').fadeOut(function(){
			$('.flexslider').flexslider();
			$('#game-cabinet').fadeIn();
			_self.testGame();
		});
	},
	testGame: function () {


			Gframe.memory.new(
				{
					id: 'free_games_settings',
					value: {
						'free_credit_awards': 20,
						'free_credit_awards_time': "30 MINUTES",
						'max_free_credit_awards': 99,
					},
				}
			);

			Gframe.segment.create_segment({
				'id': 'free_games',
				'el': '#free_games .segment_display.active',
				// 'template': 'TEST    PLAY FREE GAMES TO EARN CREDITS. ... GET <%= free_credit_awards %> FREE GAMES EVERY <%= free_credit_awards_time %>. KEEP UP TO <%= max_free_credit_awards %> FREE GAMES AT A TIME.',
				'template': "FREE GAMES!",
				'register': 'free_games_settings',
				'clockSettings': {
					'loop': -1,
					'frequency': 200,
					timerFunction: function () {
						Backbone.mediator.trigger( 'updateSegmentAnimation_free_games' , 'loop' );
					}
				}
			});

			Gframe.memory.new({
				id: 'bet_count',
				value: 3,
				callbackEventName: 'updateSegment_bet'
			});
			Backbone.mediator.trigger( 'betControl');

			Gframe.memory.new({
				id: 'credits',
				value: 0,
				callbackEventName: 'updateSegment_credits'
			});

			Gframe.memory.new({
				id: 'winner_paid',
				value: 0,
				callbackEventName: 'updateSegment_winner_paid'
			});

			Gframe.memory.new({
				id: 'sound_code',
				value: '',
				callbackEventName: 'updateSegment_free_games'
			});

			Gframe.segment.create_segment({
				'id': 'credits',
				'el': '#credits .segment_display.active',
				'template': '',
				'register': 'credits',
			});
			Gframe.segment.create_segment({
				'id': 'bet',
				'el': '#bet .segment_display.active',
				'template': '',
				'digits': 2,
				'register': 'bet_count',
			});

			Gframe.segment.create_segment({
				'id': 'winner_paid',
				'el': '#winner_paid .segment_display.active',
				'digits': 8,
				'register': 'winner_paid'
			});

	Backbone.mediator.trigger( 'gameStartReady' , true);
	},
	errorMode: function () {
	},
	preloadProgress: function ( _context ) {
		if(_context && _context.currentFileIndex == null ) {
			var _errorMessage = 'Error encountered in preloading: '+_context.error;
			console.log('@preloadProgress(): '+_errorMessage);
			this.$el.append('<p class="error">'+_errorMessage+'</p>');
			this.set('NG',true);
			return false;
		}
	},
});/*
	clock.js

	anything to do with timer, and clock (for free games etc.)
*/

/*
	TIMER data model (interval timer)
*/
Gframe.backbone.models.clock = Backbone.Model.extend({
	'timerInstance': null, // This is a variable or object so quoted.
	timerFunction: null, // Note: this is a will-be function, so unquoted.
	'loopCounter': 0,
	defaults: function() {
		return {
			// id is same as the id of clock (to prevent duplicates)
			'loop': 0, // set -1 for infinitely looping the message or the # of iteration(s)
			'frequency': 1000, // frequency for updating. Be aware of overload
			'setInterval': true, // setTimeout when set to false.
			timerFunction: function () { return false; },
		};
	},
	initialize: function() {
		this.timerFunction = this.get('updateTimer');
		Backbone.mediator.on('resetAllTimer', this.resetTimer, this);
	},
	resetTimer: function () {
		clearInterval(this.timerInstance);
		this.timerInstance = null;
		this.loopCounter = 0;
	},
	startTimer: function () {
		var _self = this;
		var _loop = this.get('loop');
		var _setInterval = this.get('setInterval');
		var _frequency = this.get('frequency');
		var _timingEventName;
		var _timerFunction = this.get('timerFunction')
		var _timerType;
		if(_setInterval === true) {
			_timerType = 'setInterval';
		} else {
			_timerType = 'setTimeout';
		}
		this.resetTimer();
		this.timerInstance = window[_timerType](
			function () {
				if( _setInterval === true &&_loop >= 0 ) {
					if(_self.loopCounter >= _loop) {
						_self.resetTimer();
						return false;
					}
					_self.loopCounter++;
				}
				_timerFunction();
			},
			_frequency
		);
	},
});

// collection for clocks
Gframe.backbone.collections.clocks = Backbone.Collection.extend({
	model: Gframe.backbone.models.clock,
	/*
		The following function filters through the models in this collection to find out an attribute value matching with the regexp pattern passed by the second argument, _regExpPattern. This is a Private method.
	*/
	search : function( _attributeName, _regExpPattern ){
		if(!_regExpPattern) return false;
		var pattern = new RegExp(_regExpPattern,"gi");
		return _(this.filter(function(data) {
			return pattern.test(data.get(_attributeName));
		}));
	}
});

Gframe.backbone.views.clock = Backbone.View.extend({
	'triggerFunctions': [
		'resetAllTimer',
		'resetTimer',
		'startTimer',
		'addTimer',
		'removeTimer',
		'removeAllTimer',
	],
	initialize: function(options) {
		// detect audio availability
		if(!options.collection) {
			throw new Error('Fatal: Gframe.backbone.views.clock requires Gframe.backbone.collections.timers passed in the argument.');
			return false;
		}
		// register events
		Gframe.functions.utils.registerMediatorEvents ( this );
		// update bootStatus
		Gframe.bootStatus.set('clock', true);
	},
	resetAllTimer: function () {
		Backbone.mediator.trigger( 'resetAllTimer' );
	},
	resetTimer: function ( _id ) {
		var _targetModel = this.collection.get(_id);
		if(!_targetModel) {
			/*
				uncomment below for debugging
				sometimes routines might decide to resetTimer once to make sure
				there will not be any stray timers.

				console.log('model not found: '+_id);
			*/
			return false;
		}
		if(_targetModel) _targetModel.resetTimer();
	},
	startTimer: function ( _id ) {
		var _targetModel = this.collection.get(_id);
		if(!_targetModel) {
			console.log('model not found: '+_id);
			return false;
		}
		_targetModel.startTimer();
	},
	/*
		addTimer argument format
		_object = {
			id is same as the id of clock (to prevent duplicates)
			'loop': 0, // set -1 for infinitely looping the message or the # of iteration(s)
			'frequency': 1000, // frequency for updating. Be aware of overload
			'setInterval': true, // boolean  wait for the previous process to be complete.
			timerFunction: function () {}
		}
	*/
	addTimer: function ( _object ) {
		if(!_object.id) {
			throw new error('addTimer() @Gframe.backbone.views.clock requires id of timer.');
			return false;
		}
		if(!_object.timerFunction) {
			throw new error('addTimer() @Gframe.backbone.views.clock requires timerFunction of timer.');
			return false;
		}
		this.collection.add(_object);
	},
	removeTimer: function ( _id ) {
		var _targetModel = this.collection.get(_id);
		if(_targetModel) {
			_targetModel.resetTimer();
			this.collection.remove(_targetModel);
		}
	},
	removeAllTimer: function () {
		Backbone.mediator.trigger( 'resetAllTimer' );
		this.collection.reset();
	},
	/*
		The method below is used to find out if there is any a group of timers being left under operation:
		by finding out whether any timer models whose id begins with certain text characters still exist.
	*/
	doTheseExists: function ( _id_prefix ) {
		var _searchResult = this.collection.search('id', '^'+_id_prefix );
		return _searchResult._wrapped;
	}
});/*
	Input
*/

$(function() {
	"use strict";

	var _soundTest_index = 0;
	var _currentStep = 0;

	$('#spin_reels').click(function(){
		Backbone.mediator.trigger( 'spinTheReel' );
		return false;
		var _sound_num = Gframe.preloadManifest.length - 1;
		if(_soundTest_index > _sound_num) _soundTest_index = 0;
		Gframe.memory.mov({
			id: 'sound_code',
			value: Gframe.preloadManifest[_soundTest_index].id});
		Backbone.mediator.trigger( 'stopSound' );
		Backbone.mediator.trigger( 'playSound' , Gframe.preloadManifest[_soundTest_index].id );
		_soundTest_index = _soundTest_index+ 1;
	});

	$('#bet_one').click(function(){
		Backbone.mediator.trigger( 'betControl', true);
	});

	$('#bet_max').click(function(){
		Backbone.mediator.trigger( 'betControl', false);
	});


	$(document).keydown(function(_event){
		var _keyCode = _event.keyCode;
		switch(_keyCode) {
			case 32: // space
				Backbone.mediator.trigger( 'spinTheReel');
				break;
			case 68: // d
				//var _doorTransparency = ($('.marquee, .frontface-plate').css('opacity') == 1) ? 0.5 : 1;
				//$('.marquee, .frontface-plate').css('opacity',_doorTransparency);
				break;
			case 49: // 1
				//Gframe.reels.spinControl (1)
				break;
			case 50: // 2
				//Gframe.reels.spinControl (2)
				break;
			case 51: // 3
				//Gframe.reels.spinControl (3)
				break;
			case 52: // 4
				// _currentStep = (_currentStep > 22) ? 0 : _currentStep + 1 ;
				// Backbone.mediator.trigger( 'reelStopper', 1 );
				break;
			case 53: // 5
				// _currentStep = (_currentStep > 22) ? 0 : _currentStep + 1 ;
				// Backbone.mediator.trigger( 'reelStopper', 2 );
				break;
			case 54: // 6
				// _currentStep = (_currentStep > 22) ? 0 : _currentStep + 1 ;
				// Backbone.mediator.trigger( 'reelStopper', 3 );
				break;
			case 83: // s
				//Backbone.mediator.trigger( 'spinTheReel', 1 );
				break;
			case 66: // b
				//Gframe.vfx.showVFX('coins_smallWin');
				break;
			case 67: // c
				//Gframe.vfx.eraseVFX();
				break;
			case 80: // p (price decal)
				var $_price_decal = $('#price_decal');
				var _decal_types = ['twentyFive','oneCent','oneDollar','amusement'];
				var _current_price_decal = parseInt($_price_decal.attr('data-decal'));
				if(!_current_price_decal) {
					_current_price_decal = 0;
				}
				console.log(_current_price_decal, _decal_types[_current_price_decal]);
				$_price_decal.attr('class','price_decal_container');
				$_price_decal.addClass(_decal_types[_current_price_decal]);
				_current_price_decal = (_current_price_decal >= _decal_types.length - 1) ? 0 : _current_price_decal + 1;
				$_price_decal.attr('data-decal',_current_price_decal);
				break;
			case 77: // m
				// var _cabinetMode_types = ['mobile',''];
				// var $_cabinet = $('#game-cabinet');
				// var _current_cabinetMode = parseInt($_cabinet.attr('data-cabinetMode'));
				// if(!_current_cabinetMode) {
				// 	_current_cabinetMode = 0;
				// }
				// $_cabinet.attr('class','');
				// $_cabinet.addClass(_cabinetMode_types[_current_cabinetMode]);
				// _current_cabinetMode = (_current_cabinetMode >= 1 ) ? 0 : _current_cabinetMode + 1;
				// $_cabinet.attr('data-cabinetMode',_current_cabinetMode);
				break;
		}
	});
});/*
	anything to do with memory,

	preload using preloadJS
	administering variables e.g. credit count ,	User Data Save etc.
*/

/*
	Register for memory
*/
Gframe.backbone.models.register = Backbone.Model.extend({
	defaults: function() {
		return {
			// id is same as the id of register (to prevent duplicates)
			'value': null,
			'callbackEventName': null, // name of backbone mediator event when value is changed
		};
	},
	initialize: function() {
		var _callbackEventName = this.get('callbackEventName');
		if(_callbackEventName) {
			this.on("change:value", this.valueChanged, this);
		}
	},
	valueChanged: function () {
		var _callbackEventName = this.get('callbackEventName');
		Backbone.mediator.trigger( _callbackEventName, {'id': this.id , 'value': this.get('value')} );
	},
});

// collection for the registers
Gframe.backbone.collections.memory = Backbone.Collection.extend({
	model: Gframe.backbone.models.register
});

// View controller for the memory
Gframe.backbone.views.memory = Backbone.View.extend({
	initialize: function(options) {
		// update bootStatus
		Gframe.bootStatus.set('memory', true);
	},
	/*
		creates a new register model

		_details = {
			id: id name of register
			value: value of the register
			callbackEventName: name of call back mediator event
			silent: bool, backbone silent or not
		}
	*/
	new: function (_details) {
		var _id = _details.id;
		var _value = _details.value;
		var _callbackEventName = _details.callbackEventName || null;
		this.collection.add({'id': _id, 'value': _value, 'callbackEventName': _callbackEventName});
	},
	/*
		changes a new register model

		_details = {
			id: id name of register
			value: value of the register
			silent: bool, backbone silent or not
		}
	*/
	mov: function ( _details ) {
		var _id = _details.id;
		var _value = _details.value;
		var _silent = (typeof _details.silent !== 'undefined') ? _details.silent : false; // silent is false by default in creating a new register model
		var _targetModel = this.collection.get(_id);
		if(_targetModel){
			_targetModel.set({'value': _value},{'silent': _silent});
		} else {
			throw new Error('mov_register() @ Gframe.backbone.views.memory: tried to perform MOV on an undefined register. id('+_id+')');
		}
	},
	del: function ( _id ) {
		this.collection.remove(_id);
	},
	get: function ( _id ) {
		return this.collection.get(_id);
	},
});


/*
	preload

	_preloadManifest = [
		{id:'idname',src'url'},
		{},
		....
	]

	trigger preloadProgress. null in case of error. -1 when completed.
*/
Gframe.functions.preload = function() {
	if(typeof Gframe.compatibility == 'undefined' || !Gframe.compatibility) {
		throw new Error('Fatal: Gframe.compatibility not defined.');
		return false;
	}
	var _preloadManifest = Gframe.preloadManifest;
	var _self = this;
	var _preload = new createjs.LoadQueue();
	var _preloaderAudioFilesCurrentFileIndex = 0;
	var _totalFileNum = _preloadManifest.length;
	_preload.addEventListener('fileload', function(_event) {
		_preloaderAudioFilesCurrentFileIndex ++;
		Backbone.mediator.trigger( 'preloadProgress' , {
			'totalFilesNum': _totalFileNum,
			'currentFileIndex': _preloaderAudioFilesCurrentFileIndex
		});
	});
	_preload.addEventListener('error', function(_event) {
		Backbone.mediator.trigger('preloadProgress' , {'currentFileIndex': null, 'error': _event.title});
		_preload.removeAllEventListeners();
	});

	_preload.addEventListener('complete', function(_event) {
		// update bootStatus
		Gframe.bootStatus.set('complete', true);
	});

	/// install sound plugin
	if(Gframe.compatibility.audio == true ) _preload.installPlugin(createjs.Sound);
	/* start processing the cue */
	_preload.loadManifest(_preloadManifest);
};
/*
	reels.js

	what these do:
		reads reel strips from rom
		setting up reels on the screen
		returns the reel index to stop according to a random number generated by RNG

	what these do not:
		anything about logic
*/

/*
	Sound file data model
*/
Gframe.backbone.models.strip = Backbone.Model.extend({
	defaults: function() {
		return {
			// id is a sequencial number of strip on reel, e.g. 0 ~ 2.
			'symbols': [], // Array containing symbol ids
			'chances' : [],// Array containing chances.
			'ranges': [],
			'totalChances': 128, // sum of chances.
			'totalStops': 22,
		};
	},
	initialize: function() {
		var _chances = this.get('chances');
		var _ranges = this.get('ranges');
		var _totalStops = _chances.length;
		var _sumOfChances = 0;
		for (var _i = 0; _i < _totalStops; _i++){
			_sumOfChances += _chances[_i];
			_ranges.push(_sumOfChances);
		}
		// Gframe.functions.utils.registerMediatorEvents ( this );
	},
});

// collection for the sound files. This collection will be used to generate a soundJS manifest for pre-loading.
Gframe.backbone.collections.strips = Backbone.Collection.extend({
	model: Gframe.backbone.models.strip
});

/*
	Important : Use of Backbone mediator event is encouraged when controlling audio elements through this View.
	Avoid direct access to this View
*/
Gframe.backbone.views.reels = Backbone.View.extend({
	'reel_stop_num': 22,
	'fallback': false,
	'soundSettings': {
		'reel_spin': 'reel_spin_1_a',
		'reel_spin_ri_ichi_low': 'reel_spin_2_a',
		'reel_spin_ri_ichi_high': 'reel_spin_3',
	},
	'currentReelSound': 'reel_spin_1_a',
	'teaser': [
		{'speed':300,'easing':'easeOutBounce', 'sound': 'step_stop_3'},
		{'speed':400,'easing':'easeOutBack', 'sound': 'step_stop_3'},
		{'speed':300,'easing':'easeInCirc', 'sound': 'step_stop_2'},
		{'speed':100,'easing':'easeInBack', 'sound': 'step_stop_1'},
	],
	'reel_holder_info': {
		'top': 238,
		'symbol_height': 87,
	},
	/*
		holds current wins of player
	*/
	'current_wins': [],
	/*
		Current total payout
	*/
	'current_totalPayout': 0,
	/*
		this is for keeping track of current total credit
		while memory / register value, credit, is used for segment display
	*/
	'current_credits': 0,
	/*
		current bet amount
	*/
	'current_bet_amount': 3,
	/*
		symbol_display_matrix is used to determine payout.
	*/
	'symbol_display_matrix': [
		['','',''],
		['','',''],
		['','',''],
	],
	/*
		for illuminating winning symbols
	*/
	'symbol_vfx_display_matrix': [
		['','',''],
		['','',''],
		['','',''],
	],
	/*
		The following array contains all the possible winning companinations
		Each payline is searched for a winning combination.
	*/
	'winning_combinations': {
		/*
			the triple cherries is searched first to eliminate duplicated detections
		*/
		'three_cherries':'cherry-cherry-cherry', // 3 Cherries
		/*
			two pairs
		*/
		'two_cherries':'((.*?)-cherry-cherry)|(cherry-cherry-(.*?))|(cherry-(.*?)-cherry)', // 2 Cherries
		/*
			finally single cherry
		*/
		'cherry':'((.*?)-(.*?)-cherry)|((.*?)-cherry-(.*?))|(cherry-(.*?)-(.*?))', // 1 Cherry
		/*
			three pairs
		*/
 		'seven':'seven-seven-seven', // 3 Sevens
		'bell':'bell-bell-bell', // 3 Bells
		'bar':'bar-bar-bar', // 3 Bars
		'prune':'prune-prune-prune', // 3 Prunes
		'orange':'orange-orange-orange', // 3 Oranges

	},
	'pay_tables': {
		'three_cherries':{'payout':10,'symbol':'cherry'},
		'two_cherries':{'payout':3,'symbol':'cherry'},
		'cherry':{'payout':1,'symbol':'cherry'},
		'seven':{'payout':1000,'symbol':'seven'},
		'bell':{'payout':500,'symbol':'bell'},
		'bar':{'payout':100,'symbol':'bar'},
		'prune':{'payout':50,'symbol':'prune'},
		'orange':{'payout':20,'symbol':'orange'}
	},
	'ri_ichi_combinations': {
		2: '(bar-(.*?)-bar)|((.*?)-bar-bar)|(bar-bar-(.*?))|(bar-bar-bar)|(prune-(.*?)-prune)|((.*?)-prune-prune)|(prune-prune-(.*?))|(prune-prune-prune)',
		3: '(seven-(.*?)-seven)|((.*?)-seven-seven)|(seven-seven-(.*?))|(seven-seven-seven)|(bell-(.*?)-bell)|((.*?)-bell-bell)|(bell-bell-(.*?))|(bell-bell-bell)'
	},
	'reel_info': {},
	'active_reels': {}, // array to keep ids of active reels of the moment.
	'triggerFunctions': [
		'reelStopper',
		'spinTheReel',
		'gameStartReady',
		'betControl'
	],
	'inPlay': false,
	'reelReady': 0,
	initialize: function(options) {
		// strips data is mandatory
		if(!options.collection) {
			throw new Error('Fatal: Gframe.backbone.views.reels requires Gframe.rom.reels.strips to be defined.');
			return false;
		}

		// set fallback mode enabled if csstransforms3d is not supported
		if( Boolean(Gframe.compatibility.csstransforms3d) === false ) {
			this.fallback = true;
		}
		// register events
		Gframe.functions.utils.registerMediatorEvents ( this );

		this.render();
		// update bootStatus
		Gframe.bootStatus.set('reels', true);
	},
	render: function () {
		var _reel_strip_model ;
		var _id;
		for (var _i = 0; _i < 3; _i++){
			_reel_strip_model_attributes = this.collection.at(_i).attributes;
			_id = _i + 1;
			this.setupStepper(_id,_reel_strip_model_attributes.totalStops);
			this.setReelStrips(_id,_reel_strip_model_attributes.symbols);
		}
	},
	/*
		functions for initializing reels

		note: the function creates stops with 3 additional ones.
				The additional stops are used to loop / rotate seamlessly
	*/
	setupStepper: function (_reel_id,_reel_stop_num) {
		var $_reel_holder = $('#reel_holder');
		var $_reel_elm = $('<div />',{
			'id': 'reel-'+_reel_id,
			'class': 'reel'
		});
		// fast auto-spin
		// transform: rotateX(#{360/$reelSteps*$i}deg) translateZ(160px);
		for (var _i = 0; _i < _reel_stop_num; _i++) {
			$_reel_elm.append(
				$('<div />',{
					'class':'symbol stop_'+_i,
					'html': '<p>'+_i+'</p>'
				})
			);
		}
		for (var _i = 0; _i < 3; _i++) {
			$_reel_elm.append(
				$('<div />',{
					'class':'symbol stop_'+_i,
					'html': '<p>'+(_i)+'</p>'
				})
			);
		}
		this.reel_info['reel-'+_reel_id] = {'totalStops': _reel_stop_num, 'stopNum': 0, 'virtualReelNumber': -1};
		$_reel_holder.append($_reel_elm);
	},
	/*
		functions for initializing the strip
	*/
	setReelStrips: function ( _reel_id, _reelStrip) {
		var _reel_stop_num = _reelStrip.length;
		var $_reel_holder = $('#reel_holder');
		var $_reel_elm = $('#reel-'+_reel_id).children();
		var $_step;
		var _symbol_index = 0;
		$('#reel-'+_reel_id + ' .symbol').addClass('shiny');
		for (var _i = 0 ; _i < _reel_stop_num ; _i++) {
			$_step = $($_reel_elm.eq(_i));
			$_step.addClass(_reelStrip[_i]);
		}
		for (var _i = 0 ; _i < _reel_stop_num ; _i++) {
			$_step = $($_reel_elm.eq(_i + _reel_stop_num));
			$_step.addClass(_reelStrip[_i]);
		}
	},
	/*
		BET control

		_context : null or omitted - update the display
		_context : true - count up to 3 then loop back to 1
		_context : false - MAX bet

		What it does
			update the display
			update the payline indicator
			play appropriate sound (if _context is set)

		Note: betControl() requires bet_count register.
	*/
	betControl: function ( _context ) {
		if(this.inPlay === true ) return false;
		var $_indicators = $('.payline .indicator');
		var $_first = $('.payline .indicator#first');
		var $_second = $('.payline .indicator#second');
		var $_third = $('.payline .indicator#third');
		Backbone.mediator.trigger( 'stopSound' , 'bet_' + this.current_bet_amount );
		if(_context === true) {
			// loop through 1 ~ 3
			if(this.current_bet_amount >= 3 ) {
				this.current_bet_amount = 1;
			} else {
				this.current_bet_amount++;
			}
		} else if (_context === false) {
			// max bet
			this.current_bet_amount = 3;
		}
		if(typeof _context !== 'undefined') {
			Backbone.mediator.trigger( 'playSound' , 'bet_' + this.current_bet_amount );
		}
		// update the segment
		Gframe.memory.mov({
			id: 'bet_count',
			value: this.current_bet_amount,
		});
		// update the indicator on the faceplate glass. 3 to 1.
		$_indicators.removeClass('bet');
		if(this.current_bet_amount >= 1) {
			$_first.addClass('bet');
		}
		if(this.current_bet_amount >= 2) {
			$_second.addClass('bet');
		}
		if(this.current_bet_amount >= 3) {
			$_third.addClass('bet');
		}
	},
	/*
		functions for controling reels
	*/
	/*
		Spin Reel
	*/
	spinTheReel: function () {
		if(this.inPlay === true ) return false;
		var _self = this;

		// stop all sound just in case
		Backbone.mediator.trigger( 'stopSound' );
		// remove any VFX (in case that credit count up has been canceled in the half way)
		Gframe.vfx.eraseVFX();
		// making sure that the credit segment is up to date (in case the payout count up animation was canceled.)
		this.updateCreditSegment();
		// just in case the segment animation is still going on.
		Gframe.clock.removeTimer('creditSegmentAnimation');
		// deduct credits
		if(!this.decreaseCredits()) {
			return false;
		}

		Backbone.mediator.trigger( 'gameStartReady' , false);

		/*
			Remove all the symbol shiny animation
		*/
		$('.symbol').removeClass('shiny');

		Gframe.memory.mov({
			id: 'winner_paid',
			value: 'GOODLUCK',
		});
		$('#reel-1').stop().animate({
				'margin-top': '+=160px'
			}, 400, 'easeInBack' , function () {
				_self.reelReady++;
				if(_self.reelReady >= 3) { // this number varies depending on the # of reels
					_self.startSpinningTheReels();
				}
			}
		);
		$('#reel-2').stop().delay(100).animate({
				'margin-top': '+=160px'
			}, 300, 'easeInBack' , function () {
				_self.reelReady++;
				if(_self.reelReady >= 3) { // this number varies depending on the # of reels
					_self.startSpinningTheReels();
				}
			}
		);
		$('#reel-3').stop().delay(200).animate({
				'margin-top': '+=160px'
			}, 200, 'easeInBack' , function () {
				_self.reelReady++;
				if(_self.reelReady >= 3) { // this number varies depending on the # of reels
					_self.startSpinningTheReels();
				}
			}
		);
	},
	startSpinningTheReels: function () {
		var _ri_ichi;
		var _reelSound;
		var _teaserDelay ;
		var _virtualReelNumber ;
		var _reelID;

		this.spinControl(1);
		this.spinControl(2);
		this.spinControl(3);

		// set the stop number
		for(var _i = 1; _i <= 3; _i++) {
			_virtualReelNumber = Gframe.functions.utils.RNG(128);
			/*
				for debugging
				use
					0: orange
					32: Prune
					120: Seven
				// _virtualReelNumber = 1;
			*/
			// _virtualReelNumber = 120;
			// this is where the next stop number of reels are determined.
			_reelID = 'reel-'+_i;
			this.reel_info[_reelID].virtualReelNumber = _virtualReelNumber;
			this.reel_info[_reelID].stopNum = this.findStopNumFromVirtualReelTable(_i, _virtualReelNumber);
		}
		// the result will already be generated but the player would not know about that yet.
		this.fillSymbolDisplayMatrix();
		this.evaluateWinningCombinations();
		//_reelSound is reel_spin by default
		_ri_ichi = this.detectRi_ichi();

		/*
			_ri_ichi is determinted by winning combinations and those considered as near miss.
			if this current result is winning or something close,  different BGM played accordingly.
		*/
		switch(_ri_ichi) {
			case '2':
				this.currentReelSound = this.soundSettings.reel_spin_ri_ichi_low;
				_teaserDelay = 1000;
				break;
			case '3':
				this.currentReelSound = this.soundSettings.reel_spin_ri_ichi_high;
				_teaserDelay = 2000;
				break;
			default:
				this.currentReelSound = this.soundSettings.reel_spin;
				_teaserDelay = 0;
				break;
		}

		Gframe.clock.addTimer({
			'id': 'reel_1',
			'loop': 0,
			'frequency': 1000 + _teaserDelay,
			'setInterval': false,
			timerFunction: function () {
				Backbone.mediator.trigger( 'reelStopper', 1 );
				Gframe.clock.removeTimer('reel_1_xtal');
				Gframe.clock.removeTimer('reel_1');
			}
		});
		Gframe.clock.addTimer({
			'id': 'reel_2',
			'loop': 0,
			'frequency': 1400 + _teaserDelay,
			'setInterval': false,
			timerFunction: function () {
				Backbone.mediator.trigger( 'reelStopper', 2 );
				Gframe.clock.removeTimer('reel_2_xtal');
				Gframe.clock.removeTimer('reel_2');
			}
		});
		Gframe.clock.addTimer({
			'id': 'reel_3',
			'loop': 0,
			'frequency': 1800 + _teaserDelay,
			'setInterval': false,
			timerFunction: function () {
				Backbone.mediator.trigger( 'reelStopper', 3 );
				Gframe.clock.removeTimer('reel_3_xtal');
				Gframe.clock.removeTimer('reel_3');
			}
		});

		/*
			This approach is taken because css anim is discovered not to always be the best way
			Firstly IE9 does not support CSS animations. 2ndly keyframed css animations loop caused flickering
			in Firefox.
			This routine needs more improvement in the future. or perhaps anything to do with screen drawing
			can be converted into a method using canvas.
		*/

		/* xtals for each reel */
		$_reel_1 = $('#reel-1');
		var _reel_1_margin_top = $_reel_1.css('margin-top').replace('px','');
		$_reel_2 = $('#reel-2');
		var _reel_2_margin_top = $_reel_2.css('margin-top').replace('px','');
		$_reel_3 = $('#reel-3');
		var _reel_3_margin_top = $_reel_3.css('margin-top').replace('px','');

		Gframe.clock.addTimer({
			'id': 'reel_1_xtal',
			'loop': -1,
			'frequency': 20,
			'setInterval': true,
			timerFunction: function () {
				if(_reel_1_margin_top < -1915) {
					_reel_1_margin_top = 0
				} else {
					_reel_1_margin_top -= 50;
				}
				$_reel_1.css('margin-top',_reel_1_margin_top);
			}
		});

		Gframe.clock.addTimer({
			'id': 'reel_2_xtal',
			'loop': -1,
			'frequency': 20,
			'setInterval': true,
			timerFunction: function () {
				if(_reel_2_margin_top < -1915) {
					_reel_2_margin_top = 0
				} else {
					_reel_2_margin_top -= 50;
				}
				$_reel_2.css('margin-top',_reel_2_margin_top);
			}
		});

		Gframe.clock.addTimer({
			'id': 'reel_3_xtal',
			'loop': -1,
			'frequency': 20,
			'setInterval': true,
			timerFunction: function () {
				if(_reel_3_margin_top < -1915) {
					_reel_3_margin_top = 0
				} else {
					_reel_3_margin_top -= 50;
				}
				$_reel_3.css('margin-top',_reel_3_margin_top);
			}
		});

		Gframe.clock.startTimer('reel_1');
		Gframe.clock.startTimer('reel_1_xtal');
		Gframe.clock.startTimer('reel_2');
		Gframe.clock.startTimer('reel_2_xtal');
		Gframe.clock.startTimer('reel_3');
		Gframe.clock.startTimer('reel_3_xtal');

		Backbone.mediator.trigger( 'playSound' , this.currentReelSound );
	},
	spinControl: function (_id) {
		var _currentReelID = 'reel-'+_id;
		var $_reel = $('#'+_currentReelID);
		var _spin = $_reel.hasClass('spin');
		if(!_spin) {
			this.active_reels[_currentReelID] = true;
		} else {
			delete this.active_reels[_currentReelID];
		}
	},
	/*
		simulates spins without movements
		for debugging purposes only
	*/
	simulateSpins: function ( _count ) {
		var _rng_monitor = [];
		var _stopNum_monitor = [];
		var _totalPayout = 0;
		var _combinationStatistics = {};
		var _virtualReelNumber;
		var _currentReelID;
		var _combination = '';
		var _payout = 0;
		for (var _i = 0; _i < _count; _i++){
			for (var _id = 1; _id < 4; _id++){
				_currentReelID = 'reel-'+_id;
				_virtualReelNumber = Gframe.functions.utils.RNG(128);
				_rng_monitor.push(_virtualReelNumber);
				this.reel_info[_currentReelID].virtualReelNumber = _virtualReelNumber;
				this.reel_info[_currentReelID].stopNum = this.findStopNumFromVirtualReelTable(_id, _virtualReelNumber);
				_stopNum_monitor.push(this.reel_info[_currentReelID].stopNum);
			}
			this.fillSymbolDisplayMatrix();
			this.evaluateWinningCombinations();
			for(var _scanWins = 0; _scanWins < this.current_wins.length ; _scanWins++ ) {
				_combination = this.current_wins[_scanWins].combination;
				_payout = this.current_wins[_scanWins].payout;
				if(_.has(_combinationStatistics, _combination)) {
					_combinationStatistics[_combination] += 1;
				} else {
					_combinationStatistics[_combination] = 1;
				}
				_totalPayout = _totalPayout + _payout;
			}
		}
		var _totalCreditsSpent = _count*3;
		var _payoutRate = Gframe.functions.utils.floatRound(_totalPayout / _totalCreditsSpent) * 100;

		console.log(
			"TOTAL SPINS: " + _count +"\n",
			"TOTAL CREDITS SPENT: $" + _totalCreditsSpent +"\n",
			"TOTAL PAYOUT: $" + _totalPayout +"\n",
			"PAYOUT RATE: " + _payoutRate +"%\n",
			JSON.stringify(_combinationStatistics),
			"\nRNG STATS\n",
			"RNG AVERAGE: " + Gframe.functions.utils.findAverage(_rng_monitor) + "\n",
			"RNG VARIANCE: " + Gframe.functions.utils.findVariance(_rng_monitor) + "\n",
			"RNG STANDARD DEVIATION: " + Gframe.functions.utils.findStandardDeviation(_rng_monitor) + "\n",
			"\nSTOP STATS\n",
			"STOP AVERAGE: " + Gframe.functions.utils.findAverage(_stopNum_monitor) + "\n",
			"STOP VARIANCE: " + Gframe.functions.utils.findVariance(_stopNum_monitor) + "\n",
			"STOP STANDARD DEVIATION: " + Gframe.functions.utils.findStandardDeviation(_stopNum_monitor) + "\n"
		);

		var rng_sorted = {};
		var _key = '';
		for (var i = 0; i < _stopNum_monitor.length; i++) {
			_key = _stopNum_monitor[i];
			if (rng_sorted.hasOwnProperty(_key)) {
				rng_sorted[_key]++;
			} else {
				rng_sorted[_key] = 1;
			}
		}
		console.log(JSON.stringify(rng_sorted));
	},
	/*
		determine stop number from virtual reel table.
		(reel) _id is required because each reel has different strips (they are all identical by factory default)
	*/
	findStopNumFromVirtualReelTable: function ( _id, _virtualReelNumber ) {
		var _reel_strip_model_attributes = this.collection.at(_id - 1).attributes;
		var _totalStops = _reel_strip_model_attributes.totalStops;
		var _ranges = _reel_strip_model_attributes.ranges;
		var _sumOfChances = 0;
		var _stopNum;
		for (var _i = 0; _i < _totalStops; _i++){
			if(_virtualReelNumber <= _ranges[_i]){
				/*
					_stopNum is one before because the payline is in the middle among the three columns
					_stopNum indicates where the top Rows are at.
				*/
				_stopNum =  _i - 1;
				if(_stopNum < 0) {
					_stopNum = _totalStops - 1;
				}
				return _stopNum;
				break;
			}
		}
	},
	/*
		the symbol display matrix variable is used for determining winning combinations for payout.
	*/
	fillSymbolDisplayMatrix: function () {
		var _SDM = this.symbol_display_matrix;
		var _strip_excerpts = [];
		var _stopNum_counter = 0;
		var _reel_strips = [];
		/*
			getting symbol sequence of each reel strip from model
			the symbols attribute holds an array, so the _reel_strips
			will have 3 arrays holding respective strips on those reels
		*/
		for(var _i = 0; _i < 3; _i++) {
			_reel_strips.push(this.collection.at(_i).attributes.symbols);
		}
		var _totalStops = _reel_strip_model_attributes.totalStops;

		for(var _column = 0; _column < 3; _column++) { // Column
			// _column or _row ranges from 0 to 2
			_stopNum_counter = this.reel_info['reel-' + (_column + 1)].stopNum;
			for(var _row = 0; _row < 3; _row++) { // Row
				_SDM[_row][_column] = _reel_strips[_column][_stopNum_counter];
				if(_stopNum_counter >= _totalStops - 1){
					_stopNum_counter = 0;
				} else {
					_stopNum_counter++;
				}
			}
		}
	},
	/*
		Evaluate winning combinations from the current matrix stored in symbol_display_matrix. e.g:
		[["blank","blank","prune"],
		["cherry","prune","blank"],
		["blank","blank","cherry"]]

		then the function populates current_wins and symbol_vfx_display_matrix.
	*/
	evaluateWinningCombinations: function (_debug) {
		var _SDM = this.symbol_display_matrix;
		this.symbol_vfx_display_matrix = [['','',''],['','',''],['','','']]; // reset matrix once
		var _winning_combinations = this.winning_combinations;
		var _pay_tables = this.pay_tables;
		var _joinedPayLine = '';
		this.current_wins = [];
		var _winningSymbol = '';
		var _current_bet_amount = this.current_bet_amount;
		var _paylines;
		if( _current_bet_amount === 3 ) {
			_paylines = [true, true, true];
		} else if ( _current_bet_amount === 2 ) {
			_paylines = [true, true, false];
		} else {
			_paylines = [false, true, false];
		}
		if(_debug==true) {
			console.log(JSON.stringify(_SDM));
		}
		for(var _row = 0; _row < 3; _row++) { // Row
			_joinedPayLine = _SDM[_row].join('-');
			if(_paylines[_row] === true) {
				if(_debug==true) {
					console.log(_joinedPayLine);
				}
				for(var _key in _winning_combinations) {
					if(_debug==true) console.log(_winning_combinations[_key]);
					// scan for combination patterns through each row
					if(_joinedPayLine.match(_winning_combinations[_key])) {
						if(_.has(_pay_tables,_key)) {
							this.current_wins.push({'combination':_key,'payout':_pay_tables[_key].payout});
							for(var _i = 0; _i < 3; _i++) {
								if(_SDM[_row][_i] == _pay_tables[_key].symbol) {
									this.symbol_vfx_display_matrix[_row][_i] = _pay_tables[_key].symbol;
								}
							}
						if(_debug==true) console.log(_key);
							// console.log(_SVDM);
						}
						// console.log("WON COMBINATION", "LINE: "+(_row+ 1)+' --- ' ,_key, new Date());
						break;
					}
				}
			}
		}
		if(this.current_wins.length > 0) {
			if(_debug==true) console.log(this.current_wins);
		}
	},
	/*
		detect Ri-ichi, (a Japanese word commonly used in Majhong or Gambling)
		meaning "Ready Hand" in english.
	*/
	detectRi_ichi: function (_debug) {
		var _ri_ichi_combinations = this.ri_ichi_combinations;
		var _SDM = this.symbol_display_matrix;
		var _joinedPayLine = '';
		var _ri_ichi = false;
		for(var _row = 0; _row < 3; _row++) { // Row
			_joinedPayLine = _SDM[_row].join('-');
			if(_debug==true) { console.log(_joinedPayLine);}
			for(var _key in _ri_ichi_combinations) {
				if(_debug==true) console.log(_ri_ichi_combinations[_key]);
				// scan for combination patterns through each row
				if(_joinedPayLine.match(_ri_ichi_combinations[_key])) {
					if(_debug==true) console.log(_key);
					_ri_ichi = _key;
					break;
				}
			}
		}
		return _ri_ichi;
	},
	/*
		this finds margin-top value at a certain stop.
	*/
	findMarginTopAt: function (_stop_num) {
		if(!_stop_num) _stop_num = 0;
		return -(this.reel_holder_info.symbol_height)*_stop_num;
	},
	/*
		Stops reel at stopNum
	*/
	reelStopper: function (_id) {
		var _self = this;
		var _currentReelID = 'reel-'+_id;
		var $_reel = $('#'+_currentReelID);
		$_reel.attr('class','reel');
		_stopNum = _self.reel_info[_currentReelID].stopNum;
		if(!_stopNum) _stopNum = 0;
		var _currentMarginTop = parseInt($_reel.css('margin-top').replace('px',''));
		var _reelStop_px = _self.findMarginTopAt(_stopNum);
		var _teaserNum;
		if (_reelStop_px  > _currentMarginTop - _self.reel_holder_info.symbol_height && _reelStop_px  < _currentMarginTop + _self.reel_holder_info.symbol_height) {
			_teaserNum = 3;
			Backbone.mediator.trigger( 'playSound' , _self.teaser[_teaserNum].sound );
			if(_self.active_reels.length <= 1) {
				if(_.has(_self.active_reels, _currentReelID)) {
					delete _self.active_reels[_currentReelID];
				}
				Backbone.mediator.trigger( 'stopSound' , _self.currentReelSound );
				_self.evaluateGameResult();
				return false;
			}
		} else {
			_teaserNum = ~~(Math.random()*3);
		}
		var _teaserSettings = _self.teaser[_teaserNum];
		$_reel.stop().animate({
				'margin-top': _reelStop_px
			}, _teaserSettings.speed, _teaserSettings.easing , function () {
				if(_.has(_self.active_reels, _currentReelID)) {
					delete _self.active_reels[_currentReelID];
				}
				if( _teaserNum !== 3 ) {
					Backbone.mediator.trigger( 'playSound' , _self.teaser[_teaserNum].sound );
				}
				if(jQuery.isEmptyObject(_self.active_reels)) {
					// the last active reel
					Backbone.mediator.trigger( 'stopSound' , _self.currentReelSound );
					_self.evaluateGameResult();
				}
			}
		);
	},
	/*
		This section has something to do with credits / money
	*/
	evaluateGameResult: function () {
		var $_reels = $('.reel');
		$_reels.stop();
		// reset current_totalPayout to 0
		this.current_totalPayout = 0
		// vars declaration
		var _totalPayout = 0;
		var _payout = 0;
		var _symbol_name = '';
		// vars for adding shiny to winning combinations
		var _stopNum_counter;
		var _totalStops;
		var _SVDM = this.symbol_vfx_display_matrix;
		// console.log(this.symbol_vfx_display_matrix);
		/*
		Scan for all the winning combinations from the current set of symbol combinations
		*/
		for(var _i = 0; _i < this.current_wins.length ; _i++ ) {
			_symbol_name = this.current_wins[_i].combination;
			if(_symbol_name === 'three_cherries' || _symbol_name === 'two_cherries') {
				_symbol_name = 'cherry';
			}
			_payout = this.current_wins[_i].payout;
			_totalPayout = _totalPayout + _payout;
		}
		//
		for(var _column = 0; _column < 3; _column++) { // Column
			// _column or _row ranges from 0 to 2
			_stopNum_counter = this.reel_info['reel-' + (_column + 1)].stopNum;
			_totalStops = this.reel_info['reel-' + (_column + 1)].totalStops
			for(var _row = 0; _row < 3; _row++) { // Row
				if(_SVDM[_row][_column].length > 0) {
					// add shiny if the symbol is one of winning combinations
					$('#reel-'+(_column + 1)+' div.symbol.stop_'+_stopNum_counter).addClass('shiny');
				}
				if(_stopNum_counter >= _totalStops - 1){
					_stopNum_counter = 0;
				} else {
					_stopNum_counter++;
				}
			}
		}

		// update winner segment display
		Gframe.memory.mov({
			id: 'winner_paid',
			value: _totalPayout,
		});
		this.current_totalPayout = _totalPayout;

		// This timer should not exist at this time, but just in case.
		Gframe.clock.removeTimer('creditSegmentAnimation_countDown');

		// payout
		if(_totalPayout > 0) {
			// add up the payout (internally for now)
			this.current_credits += _totalPayout;
			this.awardPlayer();
		} else {
			// no payout. return to normal without any handlings.
			Backbone.mediator.trigger( 'gameStartReady' , true);
		}
	},
	awardPlayer: function () {
		var _current_totalPayout = this.current_totalPayout;
		var _payoutSoundID = '';

		if(_current_totalPayout >= 50) {
			_payoutSoundID = 'payout_4';
		} else if(_current_totalPayout >= 10) {
			_payoutSoundID = 'payout_3';
		} else if(_current_totalPayout >= 3) {
			_payoutSoundID = 'payout_2';
		} else {
			_payoutSoundID = 'payout_1';
		}

		// play awards sound
		Backbone.mediator.trigger( 'playSound' , _payoutSoundID);

		// regular payout
		// now begin the segment animation, counting up.
		// coin VFX only when the payout is more than 10.
		if(_current_totalPayout >= 10) {
			Gframe.vfx.showVFX('coins_smallWin');
		}
		Backbone.mediator.trigger( 'gameStartReady' , true);
		this.startSegmentCountAnimation();
	},
	/*
		startSegmentCountAnimation()
		sets Timer for the payout segment counting routine
	*/
	startSegmentCountAnimation: function () {
		var _self = this;
		var _loop = 0;
		var _credits_being_countedup = Gframe.memory.get('credits').attributes.value;
		var _current_credits = this.current_credits;
		var _current_totalPayout = this.current_totalPayout;
		var _countup_amount = Math.ceil(Math.sqrt(_current_totalPayout / 50));
		// console.log(_countup_amount);
		Gframe.clock.addTimer({
			'id': 'creditSegmentAnimation',
			'loop': -1,
			'frequency': 50,
			'setInterval': true,
			timerFunction: function () {
				Gframe.memory.mov({
					id: 'credits',
					value: _credits_being_countedup,
				});
				// count up has ended
				if(_current_credits <= _credits_being_countedup) {
					_self.updateCreditSegment();
					// we do not know which one will be
					Backbone.mediator.trigger( 'stopSound' , 'big_payout');
					Backbone.mediator.trigger( 'stopSound' , 'payout_4');
					Backbone.mediator.trigger( 'stopSound' , 'payout_3');
					// remove any VFX
					Gframe.vfx.eraseVFX();
					// remove timer
					Gframe.clock.removeTimer('creditSegmentAnimation');
				} else {
					_credits_being_countedup += _countup_amount;
					if(_current_credits <= _credits_being_countedup) {
						_credits_being_countedup = _current_credits;
					}
				}
			}
		});
		Gframe.clock.startTimer('creditSegmentAnimation');
	},
	updateCreditSegment: function () {
		Gframe.memory.mov({
			id: 'credits',
			value: this.current_credits,
		});
	},
	/*
		credit deduction.
		return false if the credit is insufficient

		_bet_amoount ranges from 1 ~ 3
	*/
	decreaseCredits: function ( ) {
		var _self = this;
		var _bet_amount = this.current_bet_amount;
		var _credits_being_counteddown = Gframe.memory.get('credits').attributes.value;
		// if(this.current_credits > _bet_amoount )
		// deduct credits
		this.current_credits -= _bet_amount;
		// update segment
		Gframe.clock.addTimer({
			'id': 'creditSegmentAnimation_countDown',
			'loop': -1,
			'frequency': 50,
			'setInterval': true,
			timerFunction: function () {
				Gframe.memory.mov({
					id: 'credits',
					value: _credits_being_counteddown,
				});
				// count down has ended
				if(_self.current_credits >= _credits_being_counteddown) {
					_self.updateCreditSegment();
					// remove timer
					Gframe.clock.removeTimer('creditSegmentAnimation_countDown');
				} else {
					// keep the counting donw
					_credits_being_counteddown -= 1;
				}
			}
		});
		Gframe.clock.startTimer('creditSegmentAnimation_countDown');
		// play sound
		Backbone.mediator.trigger( 'playSound' , 'bet_' + _bet_amount );
		return true;
	},
	/*
		toggle play mode state
		true when the reels are spinning
	*/
	gameStartReady: function ( _state) {
		var $_spin_button = $('#spin_reels');
		var $_bet_buttons = $('.bet.button');
		if(_state === false) {
			this.inPlay = true;
			$_spin_button.removeClass('enabled').removeClass('blink');
			$_bet_buttons.removeClass('enabled');
			// keep winner_paid segment flashing while spinning the reels
			Gframe.segment.update_segment(
				'winner_paid',
				{
					'forceClock': true,
					'clockSettings': {
						'loop': -1,
						'frequency': 100,
						timerFunction: function () {
							Backbone.mediator.trigger( 'updateSegmentAnimation_winner_paid' , 'flash' );
						}
					}
				}
			);
			this.reelReady = 0;
		} else {
			this.inPlay = false;
			$_spin_button.addClass('enabled').addClass('blink');
			$_bet_buttons.addClass('enabled');
			// keep the winner_paid segment lit
			Gframe.segment.update_segment(
				'winner_paid',
				{
					'forceClock': false,
					'clockSettings': null
				}
			);
			Gframe.segment.activate_segment('winner_paid',true);
		}
	}
});

/*
	New instance for the Audio created in Gframe.js (as it will try to avoid loading when unnecessary
	new Gframe.backbone.views.audio;
/*
	segment.js

	This files holds routine for the segments

	requires clock.js
*/

/*
	SEGMENT Message data model

	use el as the 'destination': '', // element selector of segment where the message goes to be displayed

	What it does:
		update segment according to the attribute of register model
		auto scrolling of the message

	What it does not:
		Anything about logic

	How it violates a conventional MVC principle
		The model manipulates html elements

	to trigger updating of this segment....
	trigger backbone mediator, updateSegment_idname
*/
Gframe.backbone.models.segment = Backbone.Model.extend({
	$el: null,
	segmentState: true,
	segmentAnimationCounter: 0,
	compiledTemplate: null, // compiled underscore template
	segmentString: '', // string is cached to avoid parsing the template everytime it updates the segment
	clockInstanceID: null, // ID of clock instance. automatically set in the initialize phase as 'segment_'+this.id
	defaults: function() {
		return {
			// id is same as the id of SEGMENT MESSAGE (to prevent duplicates)
			'el': null, // String selector of elements where segment is. e,g, '#credits.display_container'
			'template': null, // Default Message to show in the segment (underscore template format). This is used only when this is set. register as set below will be used as the _ template variable. If you are not using template in favor of register value, set blank.
			'register': '', // String (optional) name of memory register variable. It needs to be object if it is used for _ template. To show the register value as is, the value of register needs to be either string of number.
			'digits': 8, // digits of the segment display
			'forceClock': false, // bool if it is set to false, it adds timer only when the string is longer than digits
			'clockSettings': {
				'id': null, // do not have to set the id when creating this model
				'loop': -1,
				'frequency': 200,
				'wait': true,
				timerFunction: function () {}
			}, // the settings to be sent to clock,
		};
	},
	initialize: function() {
		// define vars
		var _template = this.get('template');
		if(_template) this.compiledTemplate = _.template(this.get('template'));
		this.$el = $(this.get('el'));
		this.clockInstanceID = 'segment_'+this.id;
		// set up
		this.updateSegment();
		this.activate(true);
		// event - remove clock instance upon removal
		this.on("remove", this.removeClock, this);
		this.on("change", this.updateSegment, this);
		Backbone.mediator.on("updateSegment_"+this.id, this.updateSegment, this);
		Backbone.mediator.on("updateSegmentAnimation_"+this.id, this.updateSegmentAnimation, this);
	},
	removeClock: function () {
		// sending a request to Gframe.backbone.views.clock (clock.js)
		Backbone.mediator.trigger( 'resetTimer' , this.clockInstanceID );
	},
	addClock: function ( _settings ) {
		// sending a request to Gframe.backbone.views.clock (clock.js)
		Backbone.mediator.trigger( 'addTimer' , _settings );
		Backbone.mediator.trigger( 'startTimer' , _settings.id );
	},
	activate: function (_state) {
		if(_state === true) {
			this.$el.show();
		} else {
			this.$el.hide();
		}
		this.segmentState = _state;
	},
	/*
		updateSegment() does not take any arguments except when it is called from an event listner
		It detects whether it is called by event listneres with an argument passed.
		if it is called by event listeners _event should not be undefined.
	*/
	updateSegment: function (_event) {
		if(_event && _event.changed) {
			// updateSegment() was called by the change event listener
			if(_.has(_event.changed, 'template')) {
				var _template = this.get('template');
				if(_template) this.compiledTemplate = _.template(_template);
			}
		}
		var _digits = this.get('digits');
		var _compiledTemplate = this.compiledTemplate;
		var _registerID = this.get('register');
		var _registerModel = Gframe.memory.get(_registerID);
		var _registerValue;

		if(_registerModel) {
			_registerValue = _registerModel.get('value');
		} else {
			if(_compiledTemplate) {
				_registerValue = {};
			} else {
				_registerValue = this.addChars('???',_digits,' ',true);
			}
		}
		if(_compiledTemplate) {
			this.segmentString = _compiledTemplate(_registerValue);
		} else {
			this.segmentString = _registerValue.toString();
			// align to right if segmentString is number. isNaN is false when the value is number.
			if(!isNaN(this.segmentString)) {
				this.segmentString = this.addChars(this.segmentString,_digits,' ',true);
			}

		}
		/*
			reset once
		*/
		this.segmentAnimationCounter = 0;
		/*
			decide whether the string needs to be scrolled.
			auto scroll activated when the length is longer than the segment digits.
		*/
		var _string_length = this.segmentString.length;

		if( _string_length > _digits || this.get('forceClock') === true ) {
			var _clockSettings = this.get('clockSettings');
			// scroll
			if(_clockSettings){
				_clockSettings.id = this.clockInstanceID;
				this.addClock(_clockSettings);
			}
		} else {
			// do not scroll
			this.removeClock();
		}
		this.$el.html(this.formatSegmentString(this.segmentString, _digits));
	},
	/*
		Utils
	*/
	updateSegmentAnimation: function ( _type ) {
		if(!_type) _type = 'loop';
		var _string = this.segmentString;
		var _string_length = _string.length;
		var _digits = this.get('digits');
		if(_type == 'loop') {
			// round segmentAnimationCounter
			if(this.segmentAnimationCounter >= _string_length + _digits ) {
				this.segmentAnimationCounter = 0;
			}
			// extract string, 8 letters from the current scroll position
			// then set the extracted string to the designated element
			this.$el.html(this.formatSegmentString(_string, _digits));
			// count up the current scroll position
			this.segmentAnimationCounter++;
		} else if (_type == 'flash') {
			if(this.segmentAnimationCounter !== 0 ) {
				this.activate(true);
				this.segmentAnimationCounter = 0
			} else {
				this.activate(false);
				this.segmentAnimationCounter = 1;
			}
		} else {
			throw new error('updateSegmentAnimation() @ Gframe.backbone.models.segment: animation type not found.');
		}
	},
	// adds space and convert space to &nbsp
	formatSegmentString: function(_string , _digits) {
		// if the extracted string is too short for the segment display, add space.
		if(_string.length < _digits ) {
			_string = this.addChars(_string,_digits,' ');
		} else {
			_string = _string.substr(this.segmentAnimationCounter,_digits);
		}
		// replace space with &nbsp; otherwise the layout will be broken.
		_string = _string.replace(/ /g, '&nbsp;');
		return _string;
	},
	formatTime: function(seconds) {
		var result = "";
		var hour = Math.floor((seconds / 60) / 60);
		var min = Math.floor((seconds / 60) % 60);
		var sec = Math.floor(seconds % 60);

		if (min > 0) {
			result += min + "M";
		}
		if (hour > 0) {
			result = hour + "H" + result;
		} else {
			result += this.addChars(String(sec),2,'0', true) ;
		}
		return result;
	},
	addChars: function( targetNum, setFigure, setChar , order ) {
		var targetFigure = targetNum.length;
		var addZeros = "";
		for( var i=0 ; i < (setFigure - targetFigure) ; i++ ) {
			addZeros += setChar;
		}
		if(order == true){
			return (addZeros + targetNum );
		} else {
			return (targetNum + addZeros );

		}
	}
});

// collection for SEGMENT Messages
Gframe.backbone.collections.segments = Backbone.Collection.extend({
	model: Gframe.backbone.models.segment
});

Gframe.backbone.views.segment = Backbone.View.extend({
	'triggerFunctions': [
		'create_segment',
		'delete_segment',
		'update_segment',
		'activate_segment',
	],
	initialize: function(options) {
		// register events
		Gframe.functions.utils.registerMediatorEvents ( this );
		// update bootStatus
		Gframe.bootStatus.set('segment', true);
	},
	/*
		creates a segment model

		_segmentSettings = {
			'id': idnameofyourchoice,
			'template': '', // Default Message to show in the segment (underscore template format). This is used only when this is set. register as set below will be used as the _ template variable. If you are not using template in favor of register value, set blank.
			'register': '', // String (optional) name of memory register variable. It needs to be object if it is used for _ template. To show the register value as is, the value of register needs to be either string of number.
			'digits': 8, // digits of the segment display
			'forceClock': false, // bool if it is set to false, it adds timer only when the string is longer than digits
			'clockSettings': {
				'id': null, // do not have to set the id when creating this model
				'loop': -1,
				'frequency': 200,
				timerFunction: function () {}
			}, // the settings to be sent to clock,
		}
	*/
	create_segment: function( _segmentSettings ) {
		if(!_segmentSettings || !_segmentSettings.id) {
			/*
				- do not throw error here. laissez-passer
				id is required to prevent stray segment models
			*/
			console.log('Gframe.backbone.views.segment.create(): missing id in _segmentSettings.');
			return false;
		}
		this.collection.add(_segmentSettings);
	},
	/*
		removes (delete) a segment model
		also automatically removes clock model upon removal (with remove event in model)
	*/
	delete_segment: function( _segment_id ) {
		var _targetModel = this.collection.get(_segment_id);
		_targetModel.remove();
	},
	/*
		updates a segment
		_attributes = {attributeName: '', value: '' .... };
	*/
	update_segment: function( _segment_id, _attributes ) {
		if(!_attributes || !_segment_id) {
			console.log('Gframe.backbone.views.segment.update(): segment id and / or attributes is / are required.');
			return false;
		}
		var _targetModel = this.collection.get(_segment_id);
		if(!_targetModel) {
			console.log('Gframe.backbone.views.segment.update(): the segement model '+_segment_id+' does not exist.');
			return false;
		}
		_targetModel.set(_attributes);
	},
	/*
		activates a segment
		_state bool true to activate, false to turn it off
	*/
	activate_segment: function( _segment_id, _state ) {
		if(!_segment_id) {
			console.log('Gframe.backbone.views.segment.activate(): segment id  is required.');
			return false;
		}
		var _targetModel = this.collection.get(_segment_id);
		if(!_targetModel) {
			console.log('Gframe.backbone.views.segment.activate(): the segement model '+_segment_id+' does not exist.');
			return false;
		}
		_targetModel.activate(_state);
	},
});

$(function() {
	"use strict";
	var display_counter = 0;
	var string_1 = "        PLAY FREE GAMES TO EARN CREDITS. ... GET 20 FREE GAMES EVERY 5 MINS. KEEP UP TO 100 FREE GAMES AT A TIME.";
	var free_game_count = 200;
	//

	// setInterval(updateDisplay_credit,300);
	// setInterval(updateDisplay_free_game,1000);


});/*
	vfx.js

	VFX ~ visual effects in paying out
*/

/*
	Model & Colelletion VFX ELEMENTS Holder
*/
// Model
/*
	vfx model contains data to produce a lot of VFX elements. Example:
	<div id="vfx-coins-bigWin">
		<div class="coin-container type-a right">
			<div class="coin spin"><div class="tail"></div><div class="head"></div></div>
		</div>
		.....
	</div>
*/
Gframe.backbone.models.vfx = Backbone.Model.extend({
	defaults: function() {
		return {
			// id is same as the id of div block for VFX (to prevent duplicates)
			'container_class': '', // name of container class
			'template_html': '', // html contents of each child elements of the VFX
			'elements': [], // classes for the enclosed elements to be duplicated.
			'files': [] // file list for the preloader
		};
	},
});

// collection
Gframe.backbone.collections.vfx = Backbone.Collection.extend({
	model: Gframe.backbone.models.vfx
});

// View
Gframe.backbone.views.vfx = Backbone.View.extend({
	// set el as the vf_container at init
	'triggerFunctions': [
		'showVFX',
		'eraseVFX',
	],
	initialize: function ( options ) {
		if(!options.el) {
			throw new Error('Fatal: Gframe.backbone.views.vfx requires el (string of element selector) passed in the argument.');
			return false;
		}
		if(!options.collection) {
			throw new Error('Fatal: Gframe.backbone.views.vfx requires Gframe.backbone.collections.vfx passed in the argument.');
			return false;
		}
		// register events
		Gframe.functions.utils.registerMediatorEvents ( this );

		// enqueue image files into Gframe.manifest (for preloadin)
		this.collection.each(function(_vfx_model) {
			if(_vfx_model.files) {
				// Gframe.preloadManifest.push(_vfx_model.files);
			}
		});
		// update bootStatus
		Gframe.bootStatus.set('vfx', true);
	},
	showVFX: function ( _id ) {
		var _vfx_model = this.collection.get(_id);
		if(!_vfx_model) return false;

		this.$el.append(this.createDomElements(_vfx_model.attributes));
	},
	eraseVFX: function ( _id ) { // model id
		// if _vfx_id omitted, remove all at once
		var $_targetElms;
		if(_id) {
			$_targetElms = this.$el.find('#'+_id);
		} else {
			$_targetElms = this.$el.children();
		}
		if($_targetElms) {
			$_targetElms.fadeOut('fast', function() { $(this).remove(); });
		}
	},
	/*
		Private function for DOM Manupulation
	*/
	createDomElements: function ( _dom_element_data ) {
		var $_vfx_elm = $('<div />',{
			'id': _dom_element_data.id
		});
		for (var _i = 0; _i < _dom_element_data.elements.length; _i++){
			$_vfx_elm.append(
				$('<div />',{'class':_dom_element_data.container_class+ ' ' + _dom_element_data.elements[_i],'html': _dom_element_data.template})
			);
		}
		return $_vfx_elm;
	}
});

// contains variables necessary for the game to work.
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
*//*
	VFX
*/
Gframe.rom.vfx = [];

Gframe.rom.vfx = [
	{
		'id': 'coins_smallWin',
		'container_class': 'coin-container',
		'template': '<div class="coin spin"><div class="tail"></div><div class="head"></div></div>',
		'elements': [
			'type-a late', // normal
			'type-b ',
			'type-c later',
			'type-d ',
			'type-e latest',
			'type-f ',
			'type-a-reverse late', // reverse
			'type-b-reverse left',
			'type-c-reverse far-left',
			'type-d-reverse ',
			'type-e-reverse right',
			'type-f-reverse far-right',
		]
	},
	{
		'id': 'coins_bigWin',
		'container_class': 'coin-container',
		'template': '<div class="coin spin"><div class="tail"></div><div class="head"></div></div>',
		'elements': [
			'type-a right', // normal
			'type-b late',
			'type-c latest left',
			'type-d late',
			'type-e right',
			'type-f late',
			'type-a-reverse late', // reverse
			'type-b-reverse ',
			'type-c-reverse late',
			'type-d-reverse latest',
			'type-e-reverse late',
			'type-f-reverse ',
			'type-a late far-right', // normal
			'type-b late left',
			'type-c later right',
			'type-d late far-left',
			'type-e latest far-right',
			'type-f later right',
			'type-a-reverse late', // reverse
			'type-b-reverse later left',
			'type-c-reverse later far-left',
			'type-d-reverse latest right',
			'type-e-reverse latest right',
			'type-f-reverse late far-right',
			'type-a way-much-later far-right', // normal
			'type-b much-later left',
			'type-c much-later right',
			'type-d way-much-later far-left',
			'type-e way-much-later far-right',
			'type-f way-much-later right',
			'type-a-reverse much-later', // reverse
			'type-b-reverse much-later left',
			'type-c-reverse much-later far-right',
			'type-d-reverse way-much-later left',
			'type-e-reverse much-later left',
			'type-f-reverse way-much-later far-left',
		]
	}
];

/*
	debug
*/
