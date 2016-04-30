/*
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
