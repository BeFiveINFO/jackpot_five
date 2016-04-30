/*
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
		}
		for( var _feature in Gframe.compatibility ) {
			Gframe.compatibility[_feature] = Modernizr[_feature];
		}
		if(navigator.userAgent.match(/Windows Phone/i) === true) {
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
				'template': 'TEST    PLAY FREE GAMES TO EARN CREDITS. ... GET <%= free_credit_awards %> FREE GAMES EVERY <%= free_credit_awards_time %>. KEEP UP TO <%= max_free_credit_awards %> FREE GAMES AT A TIME.',
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
		if(_context && _context.currentFileIndex === null ) {
			var _errorMessage = 'Error encountered in preloading: '+_context.error;
			console.log('@preloadProgress(): '+_errorMessage);
			this.$el.append('<p class="error">'+_errorMessage+'</p>');
			this.set('NG',true);
			return false;
		} else {
			$('#load_progress').text('Loading... ' + _context.currentFileIndex + ' / ' + _context.totalFilesNum );
		}
	},
});