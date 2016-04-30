/*
	sensors
*/

$(function() {
	"use strict";

	$(document).on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', '.reel',
		function(e){
			console.log("stopped " + $(this).attr('id'));
				// $(this).off(e);
		}
	);
});