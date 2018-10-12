var styles = {
	'background-color-top': '#0000FF',
	'background-color-bottom': '#0000FF',
	'cell-corner-radius': 0,
	'cell-padding': 15,
	'cell-padding-top': 20,
	'cell-padding-inner': 15,
	'cell-font-size': 20,
	'cell-label-color': '#0000FF',
	'cell-label-opacity': .5,
	'cell-fill': '#0000FF',
	'cell-stroke': '#0000FF',
	'cell-stroke-width': {'cell-stroke-width': 2, 'cell-stroke': '#0000FF'},
	'cell-stroke-opacity': {'cell-stroke-opacity': 1, 'cell-stroke': '#0000FF'},
	'cell-fill-opacity': .25,
	'header-font-size': 12,
	'header-label-color': '#0000FF',
	'group-label-color': '#0000FF'
}


var defaultStyles = {};


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

var fireStyles =
 {
	 'background-color-top': '#4b4b4b',
	 'background-color-bottom': '#950101',
	 'group-label-color': '#FFF',
	 'cell-label-opacity': 0.7,
	 'header-label-color': function (d, i) {
	 	 if (!d.data) return '#BBB';
		 var colors = ['#F57C00', '#FF9800', '#FFEB3B', '#f00a0a', '#C2185B'];
		 var color = colors[d.data._rootIndex % colors.length];
		 var color1 = vizuly2.core.util.rgbToHex(d3.rgb(color).brighter(1));
		 return color1;
	 },
	 'cell-fill': function (e, d, i) {
		 var colors = ['#F57C00', '#FF9800', '#FFEB3B', '#ff0a0a', '#fa1c6e'];
		 var color = colors[d.data._rootIndex % colors.length];
		 return color
	 },
	 'area-fill-opacity-over': 1,
	 'cell-stroke': function (e, d, i) {
		 var colors = ['#F57C00', '#FF9800', '#FFEB3B', '#f00a0a', '#C2185B'];
		 var color = colors[d.data._rootIndex % colors.length];
		 var color1 = vizuly2.core.util.rgbToHex(d3.rgb(color).brighter(1));
		 return color1;
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
		 var fillColors = ['#D1F704', '#D1F704', '#D1F704', '#D1F704', '#D1F704']
		 return 'url(#' + vizuly2.svg.gradient.fade(viz, fillColors[i % 5], 'vertical', [.35, 1]).attr('id') + ')';
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
		 console.log(businessColors(i))
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


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
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
				{'label': 'Autumn', 'value': 'autumnStyles'},
				{'label': 'Ocean', 'value': 'oceanStyles'},
				{'label': 'Neon', 'value': 'neonStyles'},
				{'label': 'Fire', 'value': 'fireStyles'},
				{'label': 'Business', 'value': 'businessStyles'}
			],
			'callback': changeStyles
		}
	]

	 createDemoMenu(demoOptions, 600, 600, 'vizuly - TreeMap', styles);

		changeSize(600 + ',' + 600);
}

