var skins = {
	Business: {
		'label-color': '#CCC',                    // Color of the center label
		'track-fill': '#DDDDDD',                  // Color of the background 'track' of the progress bar
		// Colors used for progress bar
		'progress-fill': function (d, i) {
			return d3.scaleOrdinal(d3.schemeCategory10)[i % 5]; // Dynamic function that returns a fill based on the index value
		},
		'progress-fill-opacity': function (d, i) {
			return 1;                           // Dynamic function that returns opacity (in this case it is 1, but the WHITE skin uses a dynamic opacity
		},
		'progress-stroke': function (d, i) {
			return d3.scaleOrdinal(d3.schemeCategory10)[i % 5]; // Dynamic function that returns stroke color based on index
		},
		'label-font-size': function (d, i) {
			return this.radius() * .25 + 'px';
		}
	},
	Fire: {
		name: 'Fire',
		'label-color': '#F13870',
		'track-fill': 'none',
		'progress-fill': function (d, i) {
			return ['#C50A0A', '#F57C00', '#FF9800', '#FFEB3B', '#C2185B'][i % 5];
		},
		'progress-fill-opacity': function (d, i) {
			return 1;
		},
		'progress-stroke': function (d, i) {
			return ['#C50A0A', '#F57C00', '#FF9800', '#FFEB3B', '#C2185B'][i % 5];
		},
		'label-font-size': function (d, i) {
			return this.radius() * .25 + 'px';
		}
	},
	White: {
		name: 'White',
		'label-color': '#FFF',
		'track-fill': null,
		'progress-fill': function (d, i) {
			return '#FFF';
		},
		'progress-fill-opacity': function (d, i) {
			return .85 / Math.exp(i * .75);
		},
		'progress-stroke': function (d, i) {
			return '#FFF';
		},
		'label-font-size' : function (d,i) {
			return this.radius() * .25 + 'px';
		}
	},
	Neon: {
		name: 'Neon',
		'label-color': '#D1F704',
		'track-fill': '#000',
		'progress-fill': function (d, i) {
			return ['#D1F704', '#A8C102', '#788A04', '#566204', '#383F04'][i % 5];
		},
		'progress-fill-opacity': function (d, i) {
			return 1;
		},
		'progress-stroke': function (d, i) {
			return ['#D1F704', '#A8C102', '#788A04', '#566204', '#383F04'][i % 5];
		},
		'label-font-size': function (d, i) {
			return this.radius() * .25 + 'px';
		}
	}
}



//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
 	console.log('changing size')
	var s = String(val).split(',');
	var diameter = s[0] * 0.8;
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[0] + 'px').style('padding-top', ((s[0] - diameter)/2) + 'px');
	viz.width(diameter).height(diameter).radius(diameter/2).update();
}

function changeSkin(val) {

			var skin = skins[val];

			viz.style('label-color', skin['label-color'])
			 .style('track-fill', skin['track-fill'])
			 .style('progress-fill', skin['progress-fill'])
			 .style('progress-fill-opacity', skin['progress-fill-opacity'])
			 .style('progress-stroke', skin['progress-stroke'])
			 .style('label-font-size', skin['label-font-fize'])
			 .update();

}

//This is applies different end caps to each arc track by adjusting the 'capRadius' property
function changeEndCap(val) {
	vizs.forEach(function (viz,i) {
		vizs[i].capRadius(Number(val)).update();
	})
}


//This sets the same value for each radial progress
function changeData(val) {
	viz.data(Number(val)).update();
}

function runDemo() {
	var screenWidth;
	var screenHeight = 600;

	var demoOptions = [
		{
			'name': 'Display',
			'values': [
				{'label': '1000px - 1000px', 'value': '1000,1000'},
				{'label': '800px - 800px', 'value': '800,800'},
				{'label': '375px - 667px', 'value': '375,667'},
				{'label': '320px - 568px', 'value': '320,568'}
			],
			'callback': changeSize
		},
		{
			'name': 'Theme',
			'values': [
				{'label': 'Fire', 'value': 'Fire'},
				{'label': 'Business', 'value': 'default', 'selected':true},
				{'label': 'White', 'value': 'White'},
				{'label': 'Neon', 'value': 'Neon'}
			],
			'callback': changeSkin
		},
		{
			'name': 'Arc Type',
			'values': [
				{'label': 'Square', 'value': '0'},
				{'label': 'Rounded', 'value': '1', 'selected':true}
			],
			'callback': changeEndCap
		},
		{
			'name': 'Value',
			'values': [
				{'label': '20', 'value': '20'},
				{'label': '60', 'value': '60'},
				{'label': '80', 'value': '80', 'selected':true},
				{'label': '150', 'value': '150'},
				{'label': '250', 'value': '250'},
				{'label': '350', 'value': '350'}
			],
			'callback': changeData
		}
	]

	var rect;
	if (self==top) {
		rect = document.body.getBoundingClientRect();
	}
	else {
		rect =  parent.document.body.getBoundingClientRect();
	}

	//Set display size based on window size.
	screenWidth = (rect.width < 960) ? Math.round(rect.width*.95) : Math.round((rect.width - 210) *.95)
	createDemoMenu(demoOptions, screenWidth, screenHeight, 'Vizuly - Radial Progress');
	changeSize(screenWidth + ',' + screenWidth);
}
