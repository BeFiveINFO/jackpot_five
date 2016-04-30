/*
	main.js
*/
var verletData = {
		initialForce: 30,
		y: 0,
		yPrev: 0,
		force: 0,
		totalStepsNum: 0
};

$(function() {
		"use strict";
		/*
		init
	*/

		/*
		Inifinite loop for debugging
	*/
		setInterval(function() {
				processVerlet();
				$('#debug_1').html('Current height: ' + verletData.y + ' Initial Force :' + verletData.initialForce + ' Total steps: ' + verletData.totalStepsNum);
		}, 25);

		// events
		$('button#fire').click(function() {
				verletData.y = 0,
						verletData.yPrev = 0,
						verletData.totalStepsNum = 0,
						verletData.force = verletData.initialForce;
		});

		$('button.changeForce').click(function(_e) {
				var $_target = $(_e.currentTarget);
				var _value = parseInt($_target.attr('data-value'));
				// check up if the value is an integer
				if (_value > 0 && _value <= 30) {
						verletData.initialForce = _value;
				}
		});

		$(document).keydown(function(e) {
				switch (e.which) {
						case 32: // space
								$('button#fire').trigger('click');
								break;
						case 37: // left
								verletData.initialForce = (verletData.initialForce > 0) ? verletData.initialForce - 3 : 0;
								break;
						case 39: // right
								verletData.initialForce = (verletData.initialForce < 30) ? verletData.initialForce + 3 : 30;
								break;
						case 49: // 1
								$('button#f_12').trigger('click');
								break;
						case 50: // 2
								$('button#f_18').trigger('click');
								break;
						case 51: // 3
								$('button#f_24').trigger('click');
								break;
						case 52: // 4
								$('button#f_30').trigger('click');
								break;
				}
		});

		// function
		function processVerlet() {
				if (verletData.y <= 0 && verletData.force <= 0) return; // do nothing
				var _yTemp = verletData.y;
				verletData.y += (verletData.y - verletData.yPrev) + verletData.force;
				verletData.yPrev = _yTemp;
				if (verletData.force > 0) verletData.force = -1; // reset force
				verletData.totalStepsNum++; // increase totalStepsNum register by one
		}
});

/*
	debug_plotValue.js
*/
$(function() {

		// We use an inline data source in the example, usually data would
		// be fetched from a server

		var data = [],
				totalPoints = 150;

		function setData() {
				if (data.length === 0) {
						for (var i = 0; i < totalPoints; ++i) {
								data.push(0);
						}
				} else if (data.length > totalPoints) {
						data = data.slice(1);
				}

				// Do a random walk

				data.push(verletData.y);

				// Zip the generated y values with the x values

				var res = [];
				for (var i = 0; i < data.length; ++i) {
						res.push([i, data[i]])
				}

				return res;
		}

		// Set up the control widget

		var updateInterval = 50;

		var plot = $.plot("#debugChart", [setData()], {
				series: {
						shadowSize: 1 // Drawing is faster without shadows
				},
				yaxis: {
						min: 0,
						max: 600
				},
				xaxis: {
						show: false
				}
		});

		function update() {

				plot.setData([setData()]);

				// Since the axes don't change, we don't need to call plot.setupGrid()

				plot.draw();
				setTimeout(update, updateInterval);
		}

		update();
});