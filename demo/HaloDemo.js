// html element that holds the chart
var viz_container;

var repColor="#F80018";
var demColor="#0543bc";
var otherColor="#FFa400";

var styles = {
	'background-opacity': 0,
	'background-color-top': '#0000FF',
	'background-color-bottom': '#0000FF',
	'label-color': 'no preview - only visible on mouse over',
	'label-background': 'no preview - only visible on mouse over',
	'link-stroke': {'link-stroke': '#0000FF', 'link-stroke-opacity': 0.5},
	'link-stroke-opacity': 1,
	'link-fill': {'link-fill': '#0000FF', 'link-fill-opacity': .5},
	'link-fill-opacity': 1,
	'link-node-fill-opacity': 1,
	'node-stroke': {'node-stroke': '#0000FF', 'node-stroke-opacity': .7},
	'node-stroke-opacity': 1,
	'node-stroke-over': {'node-stroke-over': '#FFFF00', 'node-stroke': '#FFFF00', 'node-stroke-opacity': .7},
	'node-fill': '#0000FF',
	'node-fill-opacity': 1,
	'arc-fill': '#0000FF',
	'arc-fill-opacity': 1,
	'arc-slice-fill-opacity': 1,
	'arc-fill-over': {'arc-fill-over': '#0000FF', 'arc-fill': '#0000FF'}
}

var defaultStyles = {}

var politicalStyles = {
	'background-color-top': '#FAFAFA',
	'background-color-bottom': '#DDD',
	'link-stroke': function (d, i) {
		return (d.data.PTY == "REP") ? repColor : (d.data.PTY == "DEM") ? demColor : otherColor
	},
	'link-fill': function (d, i) {
		return (d.data.PTY == "REP") ? repColor : (d.data.PTY == "DEM") ? demColor : otherColor
	},
	'link-fill-opacity': .2,
	'node-stroke': function (d, i) {
		return (d.nodeGroup == "REP") ? repColor : (d.nodeGroup  == "DEM") ? demColor : otherColor
	},
	'node-stroke-opacity': 0.1,
	'node-stroke-over': '#FFF',
	'node-fill': function (d, i) {
		return (d.nodeGroup == "REP") ? repColor : (d.nodeGroup  == "DEM") ? demColor : otherColor
	},
	'node-fill-opacity': 0.5,
	'arc-fill': function (d, i) {
		return (d.data.PTY == "REP") ? repColor : (d.data.PTY == "DEM") ? demColor : otherColor
	},
	'arc-fill-over': '#000'
}

var neonStyles = {
	'background-color-top': '#474747',
	'background-color-bottom': '#000',
	'label-background': '#FFF',
	'label-color': '#000',
	'label-fill-opacity': .85,
	'link-stroke': '#D1F704',
	'link-fill': '#D1F704',
	'link-fill-opacity': .1,
	'node-stroke': '#D1F704',
	'node-stroke-opacity': 0.25,
	'node-stroke-over': '#FFF',
	'node-fill':  '#D1F704',
	'node-fill-opacity': 0.5,
	'arc-fill':  '#D1F704',
	'arc-fill-over': '#FFF'
}


var fireStyles = {
	'background-color-top': '#000',
	'background-color-bottom': '#9e0606',
	'label-background': '#FFF',
	'label-color': '#000',
	'label-fill-opacity': .75,
	'link-stroke': function (d, i) {
		var colors = ["#FFA000", "#FF5722", "#F57C00", "#FF9800", "#FFEB3B"];
		return colors[i % colors.length];
	},
	'link-fill': function (d, i) {
		var colors = ["#C50A0A", "#C2185B", "#F57C00", "#FF9800", "#FFEB3B"];
		return colors[i % colors.length];
	},
	'link-fill-opacity': function (d,i) {
		return (i % 5) < 2 ? .75 : .25 },
	'node-stroke': function (d, i) {
		var colors = ["#FFA000", "#FF5722", "#F57C00", "#FF9800", "#FFEB3B"];
		return colors[i % colors.length];
	},
	'node-stroke-opacity': 0.15,
	'node-stroke-over': '#FFEB3B',
	'node-fill': function (d, i) {
		var colors = ["#C50A0A", "#C2185B", "#F57C00", "#FF9800", "#FFEB3B"];
		return colors[i % colors.length];
	},
	'node-fill-opacity': 0.5,
	'arc-fill': function (d, i) {
		var colors = ["#C50A0A", "#C2185B", "#F57C00", "#FF9800", "#FFEB3B"];
		return colors[i % colors.length];
	},
	'arc-fill-opacity': .15,
	'arc-fill-over': '#FFEB3B'
}

var oceanStyles = {
	'background-color-top': '#001C4C',
	'background-color-bottom': '#1476CD',
	'label-background': '#000',
	'label-color': '#FFF',
	'label-fill-opacity': .45,
	'link-stroke': '#FFF',
	'link-fill': '#FFF',
	'link-fill-opacity': .1,
	'link-stroke-opacity': 0.05,
	'link-node-fill-opacity': .075,
	'node-stroke': '#FFF',
	'node-stroke-opacity': 0.15,
	'node-stroke-over': '#FFF',
	'node-fill':  '#FFF',
	'node-fill-opacity': 0.5,
	'arc-fill':  '#FFF',
	'arc-fill-over': '#FFF',
	'arc-fill-opacity': 0.01,
	'arc-slice-fill-opacity': 0.45
}

var businessColors = d3.scaleOrdinal(d3.schemeCategory10);

var businessStyles = {
	'background-color-top': '#FFF',
	'background-color-bottom': '#FFF',
	'label-background': '#000',
	'label-color': '#FFF',
	'label-fill-opacity': .75,
	'link-stroke': function (d, i) {
		return businessColors(i);
	},
	'link-fill': function (d, i) {
		return businessColors(i);
	},
	'link-fill-opacity': .2,
	'node-stroke': function (d, i) {
		return businessColors(i);
	},
	'node-stroke-opacity': 0.15,
	'node-stroke-over': '#00236C',
	'node-fill': function (d, i) {
		return businessColors(i);
	},
	'node-fill-opacity': 0.65,
	'arc-fill': function (d, i) {
		return businessColors(i);
	},
	'arc-slice-fill-opacity': .75,
	'arc-fill-opacity': .15,
	'arc-fill-over': '#00236C'
}


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	var r = Math.min(Number(s[0]) / 2, Number(s[1]) / 2) * .75;
	viz.update();
}

function changeStyles(val) {
	var styles = this[val];
	viz.clearStyles();
	viz.applyStyles(styles);
	viz.update();
}

var congress="House";
function changeData(val) {
	congress=val;
	renderData=data[val];
	viz.data(renderData).update();
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
				{'label': 'Default', 'value': 'defaultStyles'},
				{'label': 'Political Parties', 'value': 'politicalStyles', 'selected': true},
				{'label': 'Neon', 'value': 'neonStyles'},
				{'label': 'Fire', 'value': 'fireStyles'},
				{'label': 'Ocean', 'value': 'oceanStyles'},
				{'label': 'Business', 'value': 'businessStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Data',
			'values': [
				{'label': 'House', 'value': 'house',  'selected': true},
				{'label': 'Senate', 'value': 'senate'}
			],
			'callback': changeData
		}
	]
	
		createDemoMenu(demoOptions, 600, 600, 'vizuly 2.0 - Halo', styles);
		changeSize('600,600');
		changeStyles('politicalStyles')
}

