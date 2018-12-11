// html element that holds the chart
var viz_container;

var styles = {
	'background-opacity': 0,
	'label-color': "#0000FF",
	'background-color-top': "#0000FF",
	'background-color-bottom': "#0000FF",
	'line-stroke': '#0000FF',
	'line-stroke-over': '#FFFF00',
	'line-stroke-opacity': 0,
	'area-fill': '#0000FF',
	'area-fill-opacity': 1,
	'area-fill-opacity-over': {'area-fill-opacity-over':1, 'area-fill-opacity':0.8, 'area-fill': '#FFFF00'},
	'x-axis-font-weight': 'bold',
	'x-axis-line-stroke': "#0000FF",
	'x-axis-line-opacity': 1,
	'y-axis-line-stroke': "#0000FF",
	'y-axis-line-opacity': 1,
	'y-axis-fill': '#0000FF',
	'y-axis-fill-opacity': 1,
	'x-axis-font-size': 16
};


var defaultStyles = {};

var fireStyles =
 {
	 'background-color-top': '#4b4b4b',
	 'background-color-bottom': '#950101',
	 'label-color': '#ffd2ac',
	 'y-axis-stroke': '#DDD',
	 'y-axis-line-opacity': .5,
	 'y-axis-fill': '#FFF',
	 'y-axis-fill-opacity': .1,
	 'x-axis-line-stroke': '#FFF',
	 'area-fill': function (d, i) {
		 var fillColors = ['#F57C00', '#FF9800', '#FFEB3B', '#f00a0a', '#C2185B'];
		 return 'url(#' + vizuly2.svg.gradient.radialFade(viz, fillColors[i % 5], [.35, 1]).attr('id') + ')';
	 },
	 'area-fill-opacity-over': 1,
	 'line-stroke': function (d, i) {
		 var strokeColors = ['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B'];
		 return strokeColors[i % 5];
	 }
 }

var autumnStyles =
 {
	 'background-color-top': '#FFF',
	 'background-color-bottom': '#FFF',
	 'label-color': '#000',
	 'y-axis-line-stroke': '#000',
	 'area-fill': function (d, i) {
		 var fillColors = ['#f00a0a', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'];
		 return 'url(#' + vizuly2.svg.gradient.radialFade(viz, fillColors[i % 5], [.35, 1]).attr('id') + ')';
	 },
	 'line-stroke': function (d, i) {
		 var strokeColors = ['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B'];
		 return strokeColors[i % 5];
	 }
 }

var oceanStyles =
 {
	 'background-color-top': '#039FDB',
	 'background-color-bottom': '#021F51',
	 'label-color': '#FFF',
	 'y-axis-fill': '#FFF',
	 'y-axis-line-stroke': '#FFF',
	 'x-axis-line-stroke': '#FFF',
	 'area-fill': function (d, i) {
		 return 'url(#' + vizuly2.svg.gradient.radialFade(viz, '#FFF', [.35, 1]).attr('id') + ')';
	 },
	 'line-stroke': function (d, i) {
		 var strokeColors = 	['#0b4ca1', '#0b4ca1', '#0b4ca1', '#0b4ca1', '#0b4ca1'];
		 return strokeColors[i % 5];
	 },
	 'line-stroke-over': '#FFF'
 }

var neonStyles =
 {
	 'background-color-top': '#474747',
	 'background-color-bottom': '#000000',
	 'label-color': '#FFF',
	 'y-axis-line-stroke': '#FFF',
	 'y-axis-fill': '#FFF',
	 'x-axis-line-stroke': '#FFF',
	 'area-fill': function (d, i) {
		 return 'url(#' + vizuly2.svg.gradient.fade(viz, '#D1F704', 'vertical', [.35, 1]).attr('id') + ')';
	 },
	 'line-stroke': '#FFFF00',
	 'line-stroke-over': null
 }

var businessColors = d3.scaleOrdinal(d3.schemeCategory10).domain([0,5]);

var businessStyles =
 {
	 'background-color-top': '#FEFEFE',
	 'background-color-bottom': '#DADADA',
	 'label-color': '#000',
	 'y-axis-stroke': '#000',
	 'x-axis-stroke': '#F000',
	 'area-fill': function (d, i) {
		 return businessColors(i);
	 },
	 'line-stroke': function (d, i) {
		 return businessColors(i);
	 }
 }

function changeStyles(val) {
	var styles = this[val];
	viz.clearStyles();
	viz.applyStyles(styles);
	viz.update();
}

function changeCurve(val) {
	viz.curve(d3[val]).update();
}

//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.width(s[0]).height(s[1]).update();
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
				{'label': 'Autumn', 'value': 'autumnStyles'},
				{'label': 'Ocean', 'value': 'oceanStyles'},
				{'label': 'Neon', 'value': 'neonStyles'},
				{'label': 'Fire', 'value': 'fireStyles'},
				{'label': 'Business', 'value': 'businessStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Curve Type',
			'values': [
				{'label': 'Angular', 'value': 'curveLinearClosed', 'selected' : true},
				{'label': 'Cardinal', 'value': 'curveCardinalClosed'}
			],
			'callback': changeCurve
		}
	]
	
	createDemoMenu(demoOptions, 600, 600, 'vizuly 2.0 - Radar Chart', styles);

}

