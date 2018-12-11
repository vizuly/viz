// html element that holds the chart
var viz_container;

var businessColors = d3.scaleOrdinal(d3.schemeCategory20);

var styles = {
	'background-opacity': 0,
	'background-top': '#0000FF',
	'background-bottom': '#0000FF',
	'y-axis-label-show': false,
	'x-axis-label-show': false,
	'y-axis-font-style': 'italic',
	'x-axis-font-style': 'italic',
	'y-axis-label-color': '#0000FF',
	'x-axis-label-color': '#0000FF',
	'axis-stroke': '#0000FF',
	'axis-opacity': 1,
	'axis-font-size': 16,
	'node-stroke': '#0000FF',
	'node-stroke-width': {'node-stroke-width' : 4, 'node-stroke' : '#0000FF'},
  'node-fill': '#0000FF',
	'node-fill-opacity': 1,
	'node-stroke-opacity': 1,
	'node-stroke-over':  {'node-stroke-over': '#FFFF00', 'node-stroke': '#FFFF00', 'node-stroke-opacity': 1},
	'node-stroke-width-over': {'node-stroke-width-over': 4, 'node-stroke-width': 4, 'node-stroke': '#FFFF00', 'node-stroke-opacity': 1},
	'node-stroke-opacity-over': {'node-stroke-opacity-over': 1, 'node-stroke': '#FFFF00', 'node-stroke-opacity': 1},
	'node-fill-over': {'node-fill-over': '#FFFF00', 'node-stroke-opacity': 1},
	'node-fill-opacity-over': {'node-fill-opacity-over': 1, 'node-fill-opacity': 1}
};


var defaultStyles = {
	'background-top': '#FFF',
	'background-bottom': '#DDD',
	'axis-stroke': '#777',
	'y-axis-label-color': '#444',
	'x-axis-label-color': '#444',
	'node-stroke': '#777',
	'node-fill-opacity': .7,
	'node-fill': function (d, i) {
		var axisColors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
		return axisColors[i % axisColors.length]
	}
}

var fireStyles = {
	'background-top': '#474747',
	'background-bottom': '#000000',
	'node-fill': function (d,i) {
		var colors = ['#C50A0A', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'];
		return colors[i % colors.length];
	},
	'node-stroke': '#FFFF00',
	'axis-stroke': '#FFF',
	'node-fill-opacity': .9,
	'y-axis-label-color': '#FFF',
	'x-axis-label-color': '#FFF'
}

var sunsetStyles = {
	'background-top': '#390E1D',
	'background-bottom': '#92203A',
	'node-fill': function (d,i) {
		var colors = ['#89208F', '#C02690', '#D93256', '#DB3D0C', '#B2180E'];
		return colors[i % colors.length];
	},
	'node-stroke': '#FFF',
	'node-fill-opacity': .9,
	'axis-stroke': '#FFF',
	'y-axis-label-color': '#FFF',
	'x-axis-label-color': '#FFF'
}

var oceanStyles = {
	'background-top': '#29A3E2',
	'background-bottom': '#0c54b6',
	'node-fill': '#FFF',
	'node-stroke': '#FFF',
	'axis-stroke': '#FFF',
	'node-fill-opacity': .5,
  'y-axis-label-color': '#FFF',
  'x-axis-label-color': '#FFF'
}

var neonStyles = {
	'background-top': '#474747',
	'background-bottom': '#000',
	'node-fill': function (d,i) {
		var colors = ['#D1F704', '#D1F704', '#D1F704', '#D1F704', '#D1F704'];
		return colors[i % colors.length];
	},
	'node-stroke': function (d,i) {
		var colors = ['#D1F704', '#D1F704', '#D1F704', '#D1F704', '#D1F704'];
		return colors[i % colors.length];
	},
  'y-axis-label-color': '#FFF',
  'x-axis-label-color': '#FFF',
	'axis-stroke': '#FFF'
}


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.update();
}

function changeStyles(val) {
	var styles = this[val];
	viz.applyStyles(styles);
	viz.update();
}

function changeRadius(val) {
	var scale = (val == 'linear') ? d3.scaleLinear() : d3.scalePow().exponent(.3);
	viz.rScale(scale).update();
}


function changeY(val) {
	var scale = (val == 'linear') ? d3.scaleLinear() : d3.scalePow().exponent(.5);
	viz.yScale(scale).update();
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
				{'label': 'Default', 'value': 'defaultStyles','selected': true},
				{'label': 'Fire', 'value': 'fireStyles'},
				{'label': 'Sunset', 'value': 'sunsetStyles'},
				{'label': 'Ocean', 'value': 'oceanStyles'},
				{'label': 'Neon', 'value': 'neonStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Radius Scale',
			'values': [
				{'label': 'Linear', 'value': 'linear'},
				{'label': 'Log', 'value': 'log', 'selected' : true}
			],
			'callback': changeRadius
		},
		{
			'name': 'Y Scale',
			'values': [
				{'label': 'Linear', 'value': 'linear'},
				{'label': 'Log', 'value': 'log', 'selected' : true}
			],
			'callback': changeY
		}
	]
	
	createDemoMenu(demoOptions, 600, 600, 'vizuly 2.0 - scatter plot', styles);
}

