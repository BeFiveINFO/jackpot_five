/*
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
				var _doorTransparency = ($('.marquee, .frontface-plate').css('opacity') == 1) ? 0.5 : 1;
				$('.marquee, .frontface-plate').css('opacity',_doorTransparency);
				break;
			case 49: // 1
				Gframe.reels.spinControl (1)
				break;
			case 50: // 2
				Gframe.reels.spinControl (2)
				break;
			case 51: // 3
				Gframe.reels.spinControl (3)
				break;
			case 52: // 4
				_currentStep = (_currentStep > 22) ? 0 : _currentStep + 1 ;
				Backbone.mediator.trigger( 'reelStopper', 1 );
				break;
			case 53: // 5
				_currentStep = (_currentStep > 22) ? 0 : _currentStep + 1 ;
				Backbone.mediator.trigger( 'reelStopper', 2 );
				break;
			case 54: // 6
				_currentStep = (_currentStep > 22) ? 0 : _currentStep + 1 ;
				Backbone.mediator.trigger( 'reelStopper', 3 );
				break;
			case 83: // s
				Backbone.mediator.trigger( 'spinTheReel', 1 );
				break;
			case 66: // b
				Gframe.vfx.showVFX('coins_smallWin');
				break;
			case 67: // c
				Gframe.vfx.eraseVFX();
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
				var _cabinetMode_types = ['mobile',''];
				var $_cabinet = $('#game-cabinet');
				var _current_cabinetMode = parseInt($_cabinet.attr('data-cabinetMode'));
				if(!_current_cabinetMode) {
					_current_cabinetMode = 0;
				}
				$_cabinet.attr('class','');
				$_cabinet.addClass(_cabinetMode_types[_current_cabinetMode]);
				_current_cabinetMode = (_current_cabinetMode >= 1 ) ? 0 : _current_cabinetMode + 1;
				$_cabinet.attr('data-cabinetMode',_current_cabinetMode);
				break;
		}
	})
});