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
*/