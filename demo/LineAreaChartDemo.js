// html element that holds the chart
var viz_container;
var businessColors = d3.scaleOrdinal(d3.schemeCategory10).domain([0,5]);

var styles = {
	'background-opacity': 0,
	'label-color': '#0000FF',
	'background-color-top': '#0000FF',
	'background-color-bottom': '#0000FF',
	'line-stroke': '#0000FF',
	'line-stroke-width':  {'line-stroke-width': 3, 'line-stroke': '#0000FF'},
	'line-over-stroke': {'line-over-stroke': '#FFFF00', 'line-stroke': '#FFFF00'},
	'line-opacity': 1,
	'area-fill': {'area-fill': '#0000FF', 'area-fill-opacity': 1},
	'area-fill-opacity': .25,
	'axis-font-weight': 'bold',
	'axis-stroke': {'axis-stroke': '#0000FF', 'axis-opacity': 1},
	'axis-opacity':  {'axis-opacity': 1, 'axis-stroke': '#0000FF'},
	'axis-font-size': 16
}


var defaultStyles = {}
 
var fireStyles =
 {
	 'background-color-top': '#474747',
	 'background-color-bottom': '#000000',
	 'label-color': '#FFF',
	 'axis-stroke': '#FFF',
	 'area-fill': function (d, i) {
			var fillColors = ['#f00a0a', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'];
			return 'url(#' + vizuly2.svg.gradient.fade(viz, fillColors[i % 5], 'vertical', [.35, 1]).attr('id') + ')';
		},
	 'line-stroke': function (d, i) {
		 var strokeColors = ['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B'];
		 return strokeColors[i % 5];
	 },
	 'line-stroke-over': null
 }

var sunsetStyles =
 {
	 'background-color-top': '#390E1D',
	 'background-color-bottom': '#92203A',
	 'label-color': '#D8F433',
	 'axis-stroke': '#D8F433',
	 'area-fill-opacity': 1,
	 'area-fill': function (d, i) {
		 var fillColors = ['#89208F', '#C02690', '#D93256', '#DB3D0C', '#B2180E'];
		 return 'url(#' + vizuly2.svg.gradient.fade(viz, fillColors[i % 5], 'vertical', [.65, 1]).attr('id') + ')';
	 },
	 'line-stroke': function (d, i) {
		 var strokeColors = 	['#CD57A4', '#B236A3', '#FA6F7F', '#FA7C3B', '#E96B6B'];
		 return strokeColors[i % 5];
	 },
	 'line-stroke-over': null
 }

var oceanStyles =
 {
	 'background-color-top': '#039FDB',
	 'background-color-bottom': '#021F51',
	 'label-color': '#FFF',
	 'axis-stroke': '#FFF',
	 'area-fill': function (d, i) {
		 return 'url(#' + vizuly2.svg.gradient.fade(viz, '#FFF', 'vertical', [.35, 1]).attr('id') + ')';
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
	 'axis-stroke': '#FFF',
	 'area-fill': function (d, i) {
		 var fillColors = ['#D1F704', '#D1F704', '#D1F704', '#D1F704', '#D1F704']
		 return 'url(#' + vizuly2.svg.gradient.fade(viz, fillColors[i % 5], 'vertical', [.35, 1]).attr('id') + ')';
	 },
	 'line-stroke': '#FFFF00',
	 'line-stroke-over': null
 }

var businessStyles =
 {
	 'background-color-top': '#FEFEFE',
	 'background-color-bottom': '#DADADA',
	 'label-color': '#000',
	 'axis-stroke': '#000',
	 'area-fill': function (d, i) {
	 	 return businessColors(i);
	 },
	 'line-stroke': function (d, i) {
		 return businessColors(i);
	 },
	 'line-stroke-over': null
 }
 

function changeStyles(val) {
	var styles = this[val];
	viz.clearStyles();
	viz.applyStyles(styles);
	viz.updateStyles();
}


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.update();
}

//This sets the same value for each radial progress
var field="Volume";
function changeField(val) {
	field=val;
	if (val == "Volume") {
		viz.yTickFormat(function (d) { return (Math.round(d/1000000)) + "M";});
	}
	else {
		viz.yTickFormat(function (d) { return "$" + d;});
	}
	viz.y(function (d,i) { return d[val]}).update();
}

function changeLayout(val) {
	viz.layout(val).update();
}

function changeCurve(val) {
	viz.curve(d3[val]).update();
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
				{'label': 'Default', 'value': 'defaultStyles', 'selected': true},
				{'label': 'Fire', 'value': 'fireStyles'},
				{'label': 'Sunset', 'value': 'sunsetStyles'},
				{'label': 'Ocean', 'value': 'oceanStyles'},
				{'label': 'Neon', 'value': 'neonStyles'},
				{'label': 'Business', 'value': 'businessStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Layout',
			'values': [
				{'label': 'Overlap', 'value': 'OVERLAP', 'selected' : true},
				{'label': 'Stacked', 'value': 'STACKED'},
				{'label': 'Stream', 'value': 'STREAM'}
			],
			'callback': changeLayout
		},
		{
			'name': 'Curve Type',
			'values': [
				{'label': 'Angular', 'value': 'curveLinear', 'selected' : true},
				{'label': 'Natural', 'value': 'curveNatural'},
				{'label': 'Step', 'value': 'curveStep'}
			],
			'callback': changeCurve
		},
		{
			'name': 'Data Field',
			'values': [
				{'label': 'Volume', 'value': 'Volume', 'selected':true},
				{'label': 'Open', 'value': 'Open'},
				{'label': 'Close', 'value': 'Close'},
				{'label': 'High', 'value': 'High'},
				{'label': 'Low', 'value': 'Low'}
			],
			'callback': changeField
		}
	]

	
		createDemoMenu(demoOptions,600, 600,'vizuly 2.0 - linearea chart', styles);

}

