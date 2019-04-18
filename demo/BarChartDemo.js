// html element that holds the chart
var viz_container;

var styles = {
	'background-opacity': 0,
	'background-color-top': '#0000FF',
	'background-color-bottom': '#0000FF',
	'value-label-color': {'value-label-color': '#0000FF', 'value-label-show' : true},
	'value-label-font-size': {'value-label-font-size': 16, 'value-label-show': true},
	'value-label-font-weight': {'value-label-font-weight': 'bold', 'value-label-show' : true},
	'value-label-show': true,
	'bar-stroke': {'bar-stroke': '#0000FF', 'bar-stroke-opacity': 1, 'bar-stroke-width': 2},
	'bar-stroke-opacity': .5,
	'bar-stroke-over': {'bar-stroke-over': '#FFFF00', 'bar-stroke': '#FFFF00', 'bar-stroke-opacity': 2},
	'bar-stroke-width': {'bar-stroke-width': 3, 'bar-stroke': '#0000FF', 'bar-stroke-opacity': 1},
	'bar-fill': '#0000FF',
	'bar-fill-opacity': .25,
	'bar-fill-over':  {'bar-fill-over': '#FFFF00','bar-fill': '#FFFF00'},
	'bar-fill-opacity-over': {'bar-fill-opacity-over': 1, 'bar-fill-opacity': 1},
	'bar-radius': 5,
	'axis-font-weight': {'axis-font-weight': 700, 'y-axis-label-color': '#0000FF', 'x-axis-label-color': '#0000FF'},
	'axis-font-size': 16,
	'y-axis-label-show': false,
	'x-axis-label-show': false,
	'y-axis-font-style': 'italic',
	'x-axis-font-style': 'italic',
	'y-axis-label-color': '#0000FF',
	'x-axis-label-color': '#0000FF',
	'axis-stroke': '#0000FF',
	'axis-opacity': 0
}


var defaultStyles = {};


var blueStyles =
 {
	 'background-color-top': '#039FDB',
	 'background-color-bottom': '#021F51',
	 'value-label-color': '#FFF',
	 'x-axis-label-color': '#FFF',
	 'y-axis-label-color': '#FFF',
	 'bar-fill': '#02C3FF',
	 'bar-stroke': '#039FDB',
	 'axis-stroke': '#FFF',
	 'bar-radius': 0
 }

var pinkStyles =
 {
	 'background-color-top': '#C12780',
	 'background-color-bottom': '#540936',
	 'value-label-color': '#FFF',
	 'x-axis-label-color': '#FFF',
	 'y-axis-label-color': '#FFF',
	 'bar-fill': '#ff83de',
	 'bar-stroke': '#C12780',
	 'axis-stroke': '#FFF',
	 'bar-radius': 0
 }

var neonStyles =
 {
	 'background-color-top': '#474747',
	 'background-color-bottom': '#000000',
	 'value-label-color': '#FFF',
	 'x-axis-label-color': '#FFF',
	 'y-axis-label-color': '#FFF',
	 'bar-fill': '#D1F704',
	 'axis-stroke': '#FFF',
	 'bar-radius': function (d, i, groupIndex, e) {
		 return Number(d3.select(e).attr("height")) / 2;
	 }
 }

 
var minimalStyles =
 {
	 'background-color-top': '#F0F0F0',
	 'background-color-bottom': '#F0F0F0',
	 'value-label-color': '#444',
	 'x-axis-label-color': '#444',
	 'y-axis-label-color': '#444',
	 'bar-fill': '#555',
	 'bar-fill-over': '#000',
	 'axis-stroke': '#777',
	 'bar-stroke': '#333',
	 'bar-radius': 0
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

function changeSeries(val) {
	viz
	 .data(data.slice(0, Number(val)))
	 .update();
}

function changeLayout(val) {
	var layout = val.split('_')[0]
	viz.layout(layout).style('value-label-show', val.split('_').length > 1).update();
}

function runDemo() {
	
	// Demo menu options
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
				{'label': 'Default', 'value': 'defaultStyles', 'selected': true},
				{'label': 'Blue', 'value': 'blueStyles'},
				{'label': 'Pink', 'value': 'pinkStyles'},
				{'label': 'Neon', 'value': 'neonStyles'},
				{'label': 'Minimal', 'value': 'minimalStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Series',
			'values': [
				{'label': '3 Medals', 'value': '3', 'selected': true},
				{'label': '2 Medals', 'value': '2'},
				{'label': '1 Medal', 'value': '1'},
			],
			'callback': changeSeries
		},
		{
			'name': 'Layout',
			'values': [
				{'label': 'Clustered', 'value': 'CLUSTERED', 'selected': true},
				{'label': 'Stacked', 'value': 'STACKED'},
				{'label': 'Clustered Labels', 'value': 'CLUSTERED_LABELS'},
				{'label': 'Stacked Labels', 'value': 'STACKED_LABELS'}
			],
			'callback': changeLayout
		}
	]
	
	var title = window.location.href.indexOf('nologo') > -1 ? '' : 'vizuly 2.0 - bar chart';
	createDemoMenu(demoOptions, 600, 600, title, styles);
	
}

