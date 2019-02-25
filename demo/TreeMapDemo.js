var styles = {
	'background-opacity': 0,
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
	'cell-fill-over': {'cell-fill-over': '#FF0', 'cell-fill': '#FF0'},
	'cell-stroke-over': {'cell-stroke-over': '#FF0', 'cell-stroke': '#FF0'},
	'cell-stroke-opacity-over': {'cell-stroke-opacity-over': 1, 'cell-stroke': '#FF0', 'cell-stroke-opacity': 1},
	'cell-fill-opacity-over': {'cell-fill-opacity-over': 1, 'cell-fill': '#FF0', 'cell-fill-opacity' : 1},
	'cell-fill-opacity': .25,
	'header-font-size': 12,
	'header-label-color': '#0000FF',
	'group-label-color': '#0000FF'
}


var defaultStyles = {};


var autumnStyles =
 {
	 'background-color-top': '#fff3e7',
	 'background-color-bottom': '#ffd7d1',
	 'group-label-color': '#000',
	 'header-label-color': '#FF6D6F',
	 'cell-fill': function (e, d, i) {
		 var colors = ['#F57C00', '#FF9800', '#FFEB3B', '#ff0a0a', '#fa1c6e'];
		 var color = colors[d.rootIndex % colors.length];
		 var color1 = vizuly2.util.rgbToHex(d3.rgb(color).brighter(1));
		 return 'url(#' + vizuly2.svg.gradient.blend(viz, color1, color).attr('id') + ')';
	 }
 }

var fireStyles =
 {
	 'background-color-top': '#4b4b4b',
	 'background-color-bottom': '#950101',
	 'group-label-color': '#FFF',
	 'cell-label-opacity': 0.7,
	 'header-label-color': '#BBB',
	 'cell-fill': function (e, d, i) {
		 var colors = ['#F57C00', '#FF9800', '#FFEB3B', '#ff0a0a', '#fa1c6e'];
		 var color = colors[d.rootIndex % colors.length];
		 return color
	 },
	 'area-fill-opacity-over': 1,
	 'cell-stroke': function (e, d, i) {
		 var colors = ['#F57C00', '#FF9800', '#FFEB3B', '#f00a0a', '#C2185B'];
		 var color = colors[d.rootIndex % colors.length];
		 var color1 = vizuly2.util.rgbToHex(d3.rgb(color).brighter(1));
		 return color1;
	 }
 }

var oceanStyles =
 {
	 'background-color-top': '#021F51',
	 'background-color-bottom': '#039FDB',
	 'group-label-color': '#FFF',
	 'header-label-color': function (d, i) {
		 return '#FFF';
	 },
	 'cell-fill': function (e, d, i) {
		 var color = '#FFF'
		 return 'url(#' + vizuly2.svg.gradient.fade(viz, color, 'vertical', [.9, .4]).attr('id') + ')';
	 }
 }

var neonStyles =
 {
	 'background-color-top': '#474747',
	 'background-color-bottom': '#000000',
	 'group-label-color': '#FFF',
	 'header-label-color': '#e7f710',
	 'cell-label-color': '#000',
	 'cell-fill': function (e, d, i) {
		 var color = '#E7F710';
		 var color1 = vizuly2.util.rgbToHex(d3.rgb('#E7F710').darker(1));
		 return 'url(#' + vizuly2.svg.gradient.blend(viz, color1, color).attr('id') + ')';
	 }
 }

var businessColors = d3.scaleOrdinal(d3.schemeCategory10).domain([0,10]);

var businessStyles =
 {
	 'background-color-top': '#FEFEFE',
	 'background-color-bottom': '#DADADA',
	 'header-label-color': function (d, i) {
		 if (!d.rootIndex) return '#BBB';
		 return businessColors(d.rootIndex);
	 },
	 'cell-fill': function (e, d, i) {
		 return businessColors(d.rootIndex);
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

	 createDemoMenu(demoOptions, 600, 600, 'vizuly 2.0 - TreeMap', styles);

}

