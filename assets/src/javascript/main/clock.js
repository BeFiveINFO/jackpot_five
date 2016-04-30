/*
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
});