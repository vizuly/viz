// html element that holds the chart
var viz_container;

var styles = {
	'background-opacity': 0,
	'background-color-top': "#0000FF",
	'background-color-bottom': "#0000FF",
	'label-color': "#0000FF",
	'line-stroke': "#0000FF",
	'line-stroke-over': {'line-stroke-over': '#FFFF00', 'line-stroke': '#FFFF00'},
	'line-opacity': .25,
	'line-opacity-over': {'line-opacity-over': .25, 'line-opacity': .25},
	'area-fill': '#0000FF',
	'area-fill-opacity': .25,
	'area-fill-opacity-over': {'area-fill-opacity-over': .25, 'area-fill-opacity': .25},
	'axis-font-size': 20,
	'axis-font-weight': 'bold',
	'axis-stroke': "#0000FF",
	'axis-opacity': 1,
	'center-label-font-size': 20
};

var defaultStyles = {};

var fireStyles =
 {
	 'background-color-top': '#9e0606',
	 'background-color-bottom': '#4b4b4b',
	 'label-color': '#FFF',
	 'line-stroke': function (d,i) {
		 var colors = ['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B'];
		 return colors[i % colors.length];
	 },
	 'area-fill': function (d,i) {
		 var colors = ['#C50A0A', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'];
		 return colors[i % colors.length];
	 },
	 'axis-stroke': '#DDD',
	 'area-fill-opacity': function (d, i) {
		 return (this.layout() == vizuly2.viz.layout.OVERLAP) ? .35 : .9
	 }
 };

var sunriseStyles =
 {
	 'background-color-top': '#ffe9ee',
	 'background-color-bottom': '#fff9ea',
	 'label-color': '#777',
	 'line-stroke': function (d,i) {
		 var colors = ['#f00a0a', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'];
		 return d3.rgb(colors[i % colors.length]).darker();
	 },
	 'area-fill': function (d,i) {
		 var colors = ['#f00a0a', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'];
		 return colors[i % colors.length];
	 },
	 'area-fill-opacity': function (d, i) {
		 return (this.layout() == vizuly2.viz.layout.OVERLAP) ? .45 : .7
	 }
 };

var oceanStyles =
 {
	 'background-color-top': '#1476CD',
	 'background-color-bottom': '#001C4C',
	 'label-color': '#FFF',
	 'line-stroke': '#FFF',
	 'line-stroke-over': '#FFF',
	 'area-fill': '#FFF',
	 'axis-stroke-over': '#FFF',
	 'axis-stroke': '#d7efff',
	 'area-fill-opacity': function (d, i) {
	 	 var scale = d3.scalePow().exponent(.45).domain([0,viz.data().length]).range([.2, .95]);
		 return (this.layout() == vizuly2.viz.layout.OVERLAP) ? .2 : scale(i);
	 },
	 'area-fill-opacity-over': .7
 };

var neonStyles =
 {
	 'background-color-top': '#474747',
	 'background-color-bottom': '#000000',
	 'label-color': '#FFF',
	 'line-stroke': '#FFF',
	 'line-stroke-over': '#FFFF00',
	 'area-fill': '#D1F704',
	 'axis-stroke': '#FFF',
	 'area-fill-opacity': function (d, i) {
		 var scale = d3.scalePow().exponent(.45).domain([0,viz.data().length]).range([.2, .95])
		 return (this.layout() == vizuly2.viz.layout.OVERLAP) ? .2 : scale(i);
	 },
	 'area-fill-opacity-over': .7
 };

var businessColors = d3.scaleOrdinal(d3.schemeCategory10).domain([0,30]);

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
	 'line-stroke-over': function (d, i) {
	 	return d3.rgb(businessColors(i)).darker();
	 },
	 'area-fill-opacity': function (d, i) {
		 return (this.layout() == vizuly2.viz.layout.OVERLAP) ? .45 : .7
	 },
	 'area-fill-opacity-over': .7
 }

//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(',');
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.update();
}

function changeStyles(val) {
	var styles = this[val];
	viz.applyStyles(styles);
	viz.update();
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
				{'label': '1000px - 1000px', 'value': '1500,1500'},
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
				{'label': 'Sunrise', 'value': 'sunriseStyles'},
				{'label': 'Ocean', 'value': 'oceanStyles'},
				{'label': 'Neon', 'value': 'neonStyles'},
				{'label': 'Business', 'value': 'businessStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Layout',
			'values': [
				{'label': 'Overlap', 'value': 'OVERLAP', 'selected': true},
				{'label': 'Stacked', 'value': 'STACKED'}
			],
			'callback': changeLayout
		},
		{
			'name': 'Curve Type',
			'values': [
				{'label': 'Cardinal', 'value': 'curveCardinalClosed', 'selected': true},
				{'label': 'Angular', 'value': 'curveLinearClosed'},
				{'label': 'Basis', 'value': 'curveBasisClosed'}
			],
			'callback': changeCurve
		}
	]
	
	createDemoMenu(demoOptions, 600, 600, 'vizuly - corona', styles);
	
}

