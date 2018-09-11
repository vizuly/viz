// html element that holds the chart
var viz_container;

var styles = {
	'background-gradient-top': '#FFFF00',
	'background-gradient-bottom': '#FFFF00',
	'value-label-color': '#FFFF00',
	'value-label-font-size': 20,
	'value-label-font-weight': 'bold',
	'value-label-show': false,
	'bar-stroke': [{'name': 'bar-stroke', 'value': '#FFFF00'}, {'name': 'bar-stroke-opacity', 'value' : 1}, {'name': 'bar-stroke-width', 'value' : 2}],
	'bar-stroke-opacity': .5,
	'bar-stroke-over': [{'name': 'bar-stroke-over', 'value': '#FFFF00'}, {'name': 'bar-stroke', 'value': '#FFFF00'}, {'name': 'bar-stroke-opacity', 'value' : 2}],
	'bar-stroke-width': [{'name': 'bar-stroke-width', 'value' : 3}, {'name': 'bar-stroke', 'value': '#FFFF00'}, {'name': 'bar-stroke-opacity', 'value' : 1}],
	'bar-fill': '#FFFF00',
	'bar-fill-opacity': .25,
	'bar-fill-over': '#FFF',
	'bar-fill-opacity-over': 1,
	'bar-radius': 0,
	'axis-font-weight': 400,
	'axis-font-size': 20,
	'y-axis-label-show': true,
	'x-axis-label-show': true,
	'y-axis-font-style': 'normal',
	'x-axis-font-style': 'normal',
	'y-axis-label-color': '#FFFF00',
	'x-axis-label-color': '#FFFF00',
	'axis-stroke': '#FFF',
	'axis-opacity': .5
}

var blueStyles =
 {
	 'background-gradient-top': '#021F51',
	 'background-gradient-bottom': '#039FDB',
	 'value-label-color': '#FFF',
	 'x-axis-label-color': '#FFF',
	 'y-axis-label-color': '#FFF',
	 'bar-fill': '#02C3FF',
	 'axis-stroke': '#FFF',
	 'bar-radius': 0
 }

var pinkStyles =
 {
	 'background-gradient-top': '#540936',
	 'background-gradient-bottom': '#C12780',
	 'value-label-color': '#FFF',
	 'x-axis-label-color': '#FFF',
	 'y-axis-label-color': '#FFF',
	 'bar-fill': '#FF35BE',
	 'axis-stroke': '#FFF',
	 'bar-radius': 0
 }

var neonStyles =
 {
	 'background-gradient-top': '#000000',
	 'background-gradient-bottom': '#474747',
	 'value-label-color': '#FFF',
	 'x-axis-label-color': '#FFF',
	 'y-axis-label-color': '#FFF',
	 'bar-fill': '#D1F704',
	 'axis-stroke': '#FFF',
	 'bar-radius': function (d, i, groupIndex, e) {
		 return Number(d3.select(e).attr("height")) / 2;
	 }
 }

var axiisStyles =
 {
	 'background-gradient-top': '#ECECEC',
	 'background-gradient-bottom': '#D0D0D0',
	 'value-label-color': '#444',
	 'x-axis-label-color': '#444',
	 'y-axis-label-color': '#444',
	 'bar-fill': function (d, i, groupIndex) {
		 var axisColors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
		 return axisColors[groupIndex % axisColors.length]
	 },
	 'axis-stroke': '#777',
	 'bar-radius': 0
 }


var minimalStyles =
 {
	 'background-gradient-top': '#F0F0F0',
	 'background-gradient-bottom': '#F0F0F0',
	 'value-label-color': '#444',
	 'x-axis-label-color': '#444',
	 'y-axis-label-color': '#444',
	 'bar-fill': '#555',
	 'bar-fill-over': '#000',
	 'axis-stroke': '#777',
	 'bar-radius': 0
 }


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.update();
}

var currentStyle = blueStyles;
function changeStyles(val) {
	currentStyle = this[val];
	viz.applyStyles(currentStyle);
	viz.update();
}

function changeSeries(val) {
	viz
	 .data(data.slice(0, Number(val)))
	 .update();
}

function changeLayout(val) {
	viz.layout(val).update();
}

function setStyle(style) {
	viz.style(style, styles[style]).update();
}

function runDemo() {
	
	// Demo menu options
	demoOptions = [
		{
			'name': 'Theme',
			'values': [
				{'label': 'Blue', 'value': 'blueStyles', 'selected': true},
				{'label': 'Pink', 'value': 'pinkStyles'},
				{'label': 'Neon', 'value': 'neonStyles'},
				{'label': 'Axiis', 'value': 'axiisStyles'},
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
				{'label': 'Stacked', 'value': 'STACKED'}
			],
			'callback': changeLayout
		},
		{
			'name': 'Display',
			'values': [
				{'label': '1000px - 1000px', 'value': '1000,1000'},
				{'label': '800px - 800px', 'value': '800,800'},
				{'label': '375px - 667px', 'value': '375,667'},
				{'label': '320px - 568px', 'value': '320,568'}
			],
			'callback': changeSize
		}
	]
	
	var screenWidth;
	var screenHeight = 600;
	
	var rect;
	if (self == top) {
		rect = document.body.getBoundingClientRect();
	}
	else {
		rect = parent.document.body.getBoundingClientRect();
	}
	
	//Set display size based on window size.
	screenWidth = (rect.width < 960) ? Math.round(rect.width * .95) : Math.round((rect.width - 210) * .95)
	var title = window.location.href.indexOf('nologo') > -1 ? '' : 'vizuly - bar chart';
	createDemoMenu(demoOptions, 600, 600, title, styles);
	
	changeSize(600 + ',' + 600);
	
}

