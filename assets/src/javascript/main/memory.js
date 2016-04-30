/*
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
	$('#console').append('<p id="load_progress">WAIT</p>');
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
