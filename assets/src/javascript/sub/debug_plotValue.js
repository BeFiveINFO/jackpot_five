/*
	debug_plotValue.js
*/
$(function() {

	// We use an inline data source in the example, usually data would
	// be fetched from a server

	var data = [],
		totalPoints = 150;

	function setData() {
		if ( data.length === 0 ) {
			for (var i = 0; i < totalPoints; ++i) {
				data.push(0);
			}
		} else if ( data.length > totalPoints ) {
			data = data.slice(1);
		}

		// Do a random walk

		data.push(_currentRotationAngle);

		// Zip the generated y values with the x values

		var res = [];
		for (var i = 0; i < data.length; ++i) {
			res.push([i, data[i]])
		}

		return res;
	}

	// Set up the control widget

	var updateInterval = 50;

	var plot = $.plot("#debugChart", [ setData() ], {
		series: {
			shadowSize: 1	// Drawing is faster without shadows
		},
		yaxis: {
			min: -360,
			max: 360
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