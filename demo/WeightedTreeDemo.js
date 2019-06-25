// html element that holds the chart
var viz_container;

var styles = {
	'background-opacity': 0,
	'background-color-top': '#0000FF',
	'background-color-bottom': '#0000FF',
	'label-color': '#0000FF',
	'label-fill-opacity': .25,
	'label-font-family': 'Courier',
	'label-font-size': 18,
	'label-font-weight': 'bold',
	'label-font-weight-over': {'label-font-weight-over': 'bold', 'label-font-weight':'bold'},
	'label-text-transform':  'none',
	'link-stroke': '#0000FF',
	'link-stroke-opacity': 1,
	'link-stroke-opacity-over': {'link-stroke-opacity-over': 1, 'link-stroke-opacity':1},
	'node-fill': '#0000FF',
	'node-fill-opacity': 1,
	'node-fill-opacity-over': {'node-fill-opacity-over': 1, 'node-fill-opacity':1},
	'node-stroke': '#0000FF',
	'node-stroke-opacity': 1
}

var defaultStyles = {}


var fireStyles = {
	'background-color-top': '#000',
	'background-color-bottom': '#9e0606',
	'label-color': '#FFF',
	'label-fill-opacity': .75,
	'link-stroke': function (d, i) {
		var colors = ["#FFA000", "#FF5722", "#F57C00", "#FF9800", "#FFEB3B"];
		return colors[d.target.rootIndex % colors.length];
	},
	'link-stroke-opacity': .5,
	'node-stroke':  '#FFFF00',
	'node-stroke-opacity': 0.35,
	'node-fill': function (d, i) {
		var colors = ["#C50A0A", "#C2185B", "#F57C00", "#FF9800", "#FFEB3B"];
		return colors[d.rootIndex % colors.length];
	}
}

var sunriseStyles = {
	'background-color-top': '#ffe9ee',
	'background-color-bottom': '#fff9ea',
	'label-color': '#000',
	'link-stroke': function (d, i) {
		var colors = ["#CD57A4", "#B236A3", "#FA6F7F", "#FA7C3B", "#E96B6B"];
		return colors[d.target.rootIndex % colors.length];
	},
	'node-stroke': function (d, i) {
		var colors = ["#CD57A4", "#B236A3", "#FA6F7F", "#FA7C3B", "#E96B6B"];
		return d3.rgb(colors[d.rootIndex % colors.length]).darker();
	},
	'node-stroke-opacity': 0.65,
	'node-fill': function (d, i) {
		var colors = ["#89208F", "#C02690", "#D93256", "#DB3D0C", "#B2180E"];
		return colors[d.rootIndex % colors.length];
	}
}

var autumnStyles = {
	 'background-color-top': '#ffe1d2',
	 'background-color-bottom': '#fffeee',
	 'label-color': '#000',
	 'link-stroke': function (d, i) {
		 var colors = ['#f06e2f', '#f00a0a','#f70a77', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'];
		 return colors[d.target.rootIndex % colors.length]
	 },
	 'node-fill': function (d, i) {
		 var colors = ['#f06e2f', '#f00a0a','#f70a77', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'];
		 return colors[d.rootIndex % colors.length]
	 },
	 'node-stroke-opacity': .3,
	 'node-stroke': function (d, i) {
		 var colors = ['#f06e2f', '#f00a0a','#f70a77', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'];
		 return d3.rgb(colors[d.rootIndex % colors.length]).darker();
	 }
 }

var oceanStyles = {
	'background-color-top': '#021F51',
	'background-color-bottom': '#039FDB',
	'label-color': '#FFF',
	'label-fill-opacity': 1,
	'link-stroke': function (d, i) {
		return '#FFF'
		var colors = ["#FFA000", "#FF5722", "#F57C00", "#FF9800", "#FFEB3B"];
		return colors[d.target.rootIndex % colors.length];
	},
	'link-stroke-opacity': .5,
	'node-stroke':  '#FFF',
	'node-stroke-opacity': 1,
	'node-fill': function (d, i) {
		return '#FFF'
		var colors = ["#C50A0A", "#C2185B", "#F57C00", "#FF9800", "#FFEB3B"];
		return colors[d.rootIndex % colors.length];
	},
	'node-fill-opacity': .7
}

var businessColors = d3.scaleOrdinal(d3.schemeCategory10).domain(8);

var businessStyles = {
	'background-color-top': '#FFF',
	'background-color-bottom': '#FFF',
	'label-color': '#777',
	'link-stroke': function (d, i) {
		console.log('rootIndex = ' + d.target.rootIndex)
		var t = businessColors(d.target.rootIndex);
		
		console.log("color " + t)
		return t;
	},
	'node-stroke': function (d, i) {
		return d3.rgb(businessColors(d.rootIndex)).darker();
	},
	'node-stroke-opacity': 0.65,
	'node-stroke-over': '#00236C',
	'node-fill': function (d, i) {
		return businessColors(d.rootIndex);
	}
}

//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.horizontalPadding(s[0]/2.5).verticalPadding(Number(s[1])*.085).update();
}

function changeStyles(val) {
	var styles = this[val];
	viz.clearStyles();
	viz.applyStyles(styles);
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
				{'label': 'Default', 'value': 'defaultStyles', 'selected': true},
				{'label': 'Fire', 'value': 'fireStyles'},
				{'label': 'Sunrise', 'value': 'sunriseStyles'},
				{'label': 'Autumn', 'value': 'autumnStyles'},
				{'label': 'Ocean', 'value': 'oceanStyles'},
				{'label': 'Business', 'value': 'businessStyles'}
			],
			'callback': changeStyles
		},
	]
	
		createDemoMenu(demoOptions, 600, 600, 'vizuly - Weighted Tree', styles);
		viz.horizontalPadding(600/2.5).verticalPadding(600*.085).update();

}

