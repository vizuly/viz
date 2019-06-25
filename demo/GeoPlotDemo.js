// html element that holds the chart
var viz_container;

var styles = {
	'background-opacity': 0,
	'background-color-top': '#00F',
	'background-color-bottom': '#00F',
	'globe-stroke': {'globe-stroke': '#00F', 'globe-stroke-opacity': 1},
	'globe-stroke-opacity': 1,
	'graticule-stroke': '#00F',
	'graticule-stroke-opacity': 0,
	'graticule-stroke-width': 3,
	'shading-colors': ['#00F', '#00F'],
	'shading-opacity': 1,
	'shadow-colors': ['#00F', '#00F'],
	'shadow-spread': 1.2,
	'highlight-colors': ['#00F', '#00F'],
	'ocean-colors': ['#00F', '#00F'],
	'land-color': '#F00',
	'feature-stroke': '#00F',
	'feature-stroke-opacity': 1,
	'feature-fill': {'feature-fill': '#00F', 'feature-fill-opacity': 1},
	'feature-fill-opacity': 1,
	'feature-fill-over': {'feature-fill-over': '#FF0', 'feature-fill': '#FF0', 'feature-fill-opacity': 1},
	'feature-fill-opacity-over': {'feature-fill-opacity-over': '#FF0', 'feature-fill': '#FF0', 'feature-fill-opacity': 1},
	'plot-fill': '#00F',
	'plot-fill-opacity': 1,
	'plot-stroke': '#00F',
	'plot-stroke-width': 3,
	'plot-stroke-opacity': 1,
	'plot-fill-over': {'plot-fill-over': '#FF0', 'plot-fill': '#FF0'},
	'plot-fill-opacity-over': {'plot-fill-opacity-over': 1, 'plot-fill-opacity': 1},
	'plot-stroke-over': {'plot-stroke-over': '#FF0', 'plot-stroke': '#FF0'},
	'plot-stroke-width-over': {'plot-stroke-width-over': 3, 'plot-stroke-width': 3},
	'plot-stroke-opacity-over':  {'plot-stroke-opacity-over': 1, 'plot-stroke-opacity': 1}
}

var defaultStyles = {};

var nightStyles = {
	'background-color-top': '#555',
	'background-color-bottom': '#000',
	'background': '#000312',
	'globe-stroke': '#7487F0',
	'globe-stroke-opacity': .5,
	'graticule-stroke-opacity': 0,
	'shading-colors': ['#e6ff89', '#000'],
	'shading-opacity': .75,
	'shadow-colors': ['#F0F7B2', '#FFF'],
	'shadow-spread': 1.1,
	'highlight-colors': ['#FFf', '#555'],
	'ocean-colors': ['#1e8ece', '#090A38'],
	'land-color': '#777',
	'feature-stroke': function (d, i) {
		return '#000 '
	},
	'feature-stroke-opacity': function (d, i) {
		return 1
	},
	'feature-fill': function (d, i) {
		var axisColors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
		return axisColors[i % axisColors.length]
	},
	'feature-fill-opacity': function (d, i) {
		return 0.5
	},
	'mouseover-feature-fill': function (d, i) {
		return '#FFF'
	},
	'mouseover-feature-fill-opacity': function (d, i) {
		return .8
	},
	'plot-fill': function (d, i) {
		return '#FFC107';
	},
	'plot-fill-opacity': function (d, i) {
		return .6
	},
	'plot-stroke-opacity': function (d, i) {
		return .4
	},
	'plot-stroke': function (d, i) {
		return '#000';
	},
	'plot-stroke-width': function (d, i) {
		return ((viz.plotShape() == viz.SHAPE_CIRCLE) ? 1 : (viz.width() * .005)) + 'px';
	}
}

var ghostStyles = {
	'background-color-top': '#555',
	'background-color-bottom': '#000',
	'background': '#000312',
	'globe-stroke': '#FF0',
	'globe-stroke-opacity': .5,
	'shading-colors': ['#FFF', '#000'],
	'shading-opacity': .75,
	'shadow-colors': ['#FF0', '#FFF'],
	'shadow-spread': 1.1,
	'graticule-stroke': '#FF0',
	'graticule-stroke-opacity': .15,
	'highlight-colors': ['#FFF', '#FFF'],
	'ocean-colors': ['#000', '#000'],
	'land-color': '#777',
	'feature-stroke': function (d, i) {
		return '#fff '
	},
	'feature-stroke-opacity': function (d, i) {
		return .5
	},
	'feature-fill': '#000',
	'feature-fill-opacity': function (d, i) {
		return i/100;
	},
	'mouseover-feature-fill': function (d, i) {
		return '#FFF'
	},
	'mouseover-feature-fill-opacity': function (d, i) {
		return .8
	},
	'plot-fill': function (d, i) {
		return '#E64A19';
	},
	'plot-fill-opacity': function (d, i) {
		return .5
	},
	'plot-stroke': function (d, i) {
		return '#000';
	},
	'plot-stroke-opacity': 0.5,
	'plot-stroke-width': function (d, i) {
		return ((viz.plotShape() == viz.SHAPE_CIRCLE) ? 1 : (viz.width() * .005)) + 'px';
	}
}


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.update();
}

function changeStyles(val) {
	var styles = this[val];
	viz.clearStyles();
	viz.applyStyles(styles);
	viz.update();
}


function changePlotShape(val) {
	viz.plotShape(val);
	viz.update();
}



function runDemo() {
	
	demoOptions = [
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
				{'label': 'Default', 'value': 'defaultStyles', selected: true},
				{'label': 'Night', 'value': 'nightStyles'},
				{'label': 'Ghost', 'value': 'ghostStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Plot Shape',
			'values': [
				{'label': 'Circle', 'value': 'CIRCLE', selected: true},
				{'label': 'Bar', 'value': 'BAR'}
			],
			'callback': changePlotShape
		}
	]
	
	
	createDemoMenu(demoOptions, 600, 600, 'vizuly - GeoPlot', styles);

	
}

