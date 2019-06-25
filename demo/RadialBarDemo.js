// html element that holds the chart
var viz_container;

var styles = {
	'background-opacity': 0,
	'background-color-bottom': '#0000FF',
	'background-color-top': '#0000FF',
	'label-color': '#0000FF',
	'bar-use-drop-shadow': true,
	'bar-stroke': '#0000FF',
	'bar-stroke-opacity': 1,
	'bar-stroke-over': {'bar-stroke-over': '#FFFF00', 'bar-stroke': '#FFFF00', 'bar-stroke-opacity': 1},
	'bar-fill': '#0000FF',
	'bar-fill-opacity': 1,
	'bar-fill-over': {'bar-fill-over': '#FFFF00', 'bar-fill': '#FFFF00', 'bar-fill-opacity': 1},
	'bar-fill-over-opacity': {'bar-fill-over-opacity': 1, 'bar-fill-opacity': 1},
	'axis-font-weight': 'bold',
	'axis-font-size': 18,
	'axis-stroke': '#0000FF',
	'axis-opacity': .25
}

var defaultStyles = {};

var blueStyles =
 {
	 'background-color-top': '#021F51',
	 'background-color-bottom': '#039FDB',
	 'label-color': '#FFF',
	 'bar-fill': '#02C3FF',
	 'bar-stroke': '#FFF',
	 'bar-fill-over': '#FFF',
	 'bar-stroke-over': '#000',
	 'bar-use-drop-shadow': true,
	 'axis-stroke': '#FFF',
	 'bar-radius': 0,
	 'bar-filter-effect': null
 }

var pinkStyles =
 {
	 'background-color-top': '#540936',
	 'background-color-bottom': '#C12780',
	 'label-color': '#FFF',
	 'bar-fill': '#FF35BE',
	 'bar-stroke': '#FFF',
	 'bar-drop-shadow': true,
	 'axis-stroke': '#FFF',
	 'bar-radius': 0,
	 'bar-filter-effect': null
 }

var neonStyles =
 {
	 'background-color-top': '#000000',
	 'background-color-bottom': '#474747',
	 'label-color': '#FFF',
	 'bar-fill': '#D1F704',
	 'bar-stroke': '#FFF',
	 'axis-stroke': '#FFF',
	 'bar-radius': function (d, i, groupIndex, e) { return Number(d3.select(e).attr("height"))/2; },
	 'bar-filter-effect': null
 }

var businessColors = d3.scaleOrdinal(d3.schemeCategory10).domain(8);

var businessStyles =
 {
	 'background-color-top': '#FFF',
	 'background-color-bottom': '#FFF',
	 'label-color': '#000',
	 'bar-fill': function (d, i, groupIndex) {
		 return businessColors(groupIndex)
	 },
	 'bar-fill-over': function (d, i, groupIndex) {
	 	 return d3.rgb(businessColors(groupIndex)).darker()
	 },
	 'bar-stroke': function (d, i, groupIndex) {
	 	 return d3.rgb(businessColors(groupIndex)).darker()
	 },
	 'bar-use-drop-shadow': false,
	 'axis-stroke': '#777',
	 'bar-radius': 0,
	 'bar-filter-effect': null
 }
 
var minimalStyles =
 {
	 'background-color-top': '#FFF',
	 'background-color-bottom': '#DDD',
	 'label-color': '#000',
	 'bar-fill': '#555',
	 'bar-stroke': '#333',
	 'bar-use-drop-shadow': false,
	 'axis-stroke': '#777',
	 'bar-radius': 0,
	 'bar-filter-effect': null
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
	
	console.log("bar-use-drop-shadow = " + viz.style('bar-use-drop-shadow'))
	viz.applyStyles(styles);
	viz.update();
}

function changeSeries(val) {
	viz
	 .data(data.slice(0,Number(val)))
	 .update();
}

function changeLayout(val) {
	viz.layout(val).update();
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
				{'label': 'Default', value: 'defaultStyles', 'selected': true},
				{'label': 'Blue', 'value': 'blueStyles'},
				{'label': 'Pink', 'value': 'pinkStyles'},
				{'label': 'Neon', 'value': 'neonStyles'},
				{'label': 'Business', 'value': 'businessStyles'},
				{'label': 'Minimal', 'value': 'minimalStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Series',
			'values': [
				{'label': '3 Medals', 'value': '3', 'selected' : true},
				{'label': '2 Medals', 'value': '2'},
				{'label': '1 Medal', 'value': '1'},
			],
			'callback': changeSeries
		},
		{
			'name': 'Layout',
			'values': [
				{'label': 'Clustered', 'value': 'CLUSTERED', 'selected' : true},
				{'label': 'Stacked', 'value': 'STACKED'}
			],
			'callback': changeLayout
		}
	]

	createDemoMenu(demoOptions, 600, 600, 'vizuly - radial bar', styles);
	changeSize(600,600);
	console.log("bar-use-drop-shadow = " + viz.style('bar-use-drop-shadow'))
}

