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


});