var styles = {
	'background-opacity': 0,
	'background-color-top': "#0000FF",
	'background-color-bottom': "#0000FF",
	'radial-fill' : '#0000FF',
	'value-label-color': '#0000FF',
	'top-label-color': '#0000FF',
	'bottom-label-color': '#0000FF',
	'value-label-fill-opacity': .25,
	'top-label-fill-opacity': 1,
	'bottom-label-fill-opacity': 1,
	'track-fill': '#0000FF',
	'track-opacity': 0,
	'progress-fill': '#0000FF',
	'progress-fill-opacity': .25,
	'progress-stroke': '#0000FF',
	'label-font-size' : 20
}

var defaultStyles = {};

var businessColors = d3.scaleOrdinal(d3.schemeCategory10).domain(6)

var sunriseStyles = {
	'background-color-top': "#ffe9ee",
	'background-color-bottom': "#fff5ea",
	'value-label-color': '#F13870',
	'top-label-color': '#F13870',
	'bottom-label-color': '#F13870',
	'track-fill': 'none',
	'progress-fill': function (d, i) { return ['#FFEB3B', '#FFA000', '#FF5722', '#F57C00', '#FF9800'][i % 5]; },
	'progress-fill-opacity': function (d,i) { return (4-i)/4 },
	'progress-stroke': function (d, i) { return ['#FFEB3B', '#FFA000', '#FF5722', '#F57C00', '#FF9800'][i % 5]; }
}

var whiteStyles = {
	'background-color-top': "#777",
	'background-color-bottom': "#000",
	'value-label-color': '#FFF',
	'top-label-color': '#FFF',
	'bottom-label-color': '#FFF',
	'track-fill': 'none',
	'progress-fill': '#FFF',
	'progress-fill-opacity': function (d, i) {
		return .85 / Math.exp(i * .75);
	},
	'progress-stroke': '#FFF'
}

var oceanStyles = {
	'background-color-top': '#001C4C',
	'background-color-bottom': '#1476CD',
	'value-label-color': '#FFF',
	'top-label-color': '#FFF',
	'bottom-label-color': '#FFF',
	'track-fill': 'none',
	'progress-fill': '#FFF',
	'progress-fill-opacity': function (d, i) {
		return .85 / Math.exp(i * .75);
	},
	'progress-stroke': '#FFF'
}


var neonStyles = {
	'background-color-top': "#777",
	'background-color-bottom': "#000",
	'value-label-color': '#D1F704',
	'top-label-color': '#D1F704',
	'bottom-label-color': '#D1F704',
	'track-fill': '#000',
	'progress-fill': function (d, i) { return ['#D1F704', '#A8C102', '#788A04', '#566204', '#383F04'][i % 5]; },
	'progress-fill-opacity': 1,
	'progress-stroke': function (d, i) { return ['#D1F704', '#A8C102', '#788A04', '#566204', '#383F04'][i % 5]; }
}


var businessStyles = {
	'background-color-top': "#FFF",
	'background-color-bottom': "#EDEDED",
	'label-color': '#777',
	'top-label-color': '#777',
	'bottom-label-color': '#777',
	'track-fill': '#000',
	'track-opacity': 0.1,
	'progress-fill': function (d, i) { return  businessColors(i) },
	'progress-stroke': function (d, i) { return businessColors(i) }
}

//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(',');
	var diameter = s[0] * 0.8;
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.radius(diameter/2).update();
}

function changeStyles(val) {
	var styles = this[val];
	viz.applyStyles(styles);
	viz.update();
}

//This is applies different end caps to each arc track by adjusting the 'capRadius' property
function changeEndCap(val) {
	viz.capRadius(Number(val)).update();
}

function changeArcSpan(val) {
	var spans = val.split(',');
	viz.startAngle(Number(spans[0])).endAngle(Number(spans[1])).update();
}

//This sets the same value for each radial progress
function changeData(val) {
	viz.data(Number(val)).update();
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
				{'label': 'Sunrise', 'value': 'sunriseStyles'},
				{'label': 'Business', 'value': 'businessStyles'},
				{'label': 'White', 'value': 'whiteStyles'},
				{'label': 'Ocean', 'value': 'oceanStyles'},
				{'label': 'Neon', 'value': 'neonStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'End Cap',
			'values': [
				{'label': 'Square', 'value': '0'},
				{'label': 'Rounded', 'value': '1', 'selected':true}
			],
			'callback': changeEndCap
		},
		{
			'name': 'Arc Span',
			'values': [
				{'label': '180 Degrees', 'value': '270,90'},
				{'label': '220 Degrees', 'value': '250,110', 'selected': true},
				{'label': '260 Degrees', 'value': '230,130'},
				{'label': '360 Degrees', 'value': '180,180'}
			],
			'callback': changeArcSpan
		},
		{
			'name': 'Value',
			'values': [
				{'label': '20', 'value': '20'},
				{'label': '60', 'value': '60'},
				{'label': '80', 'value': '80', 'selected':true},
				{'label': '150', 'value': '150'},
				{'label': '250', 'value': '250'},
				{'label': '350', 'value': '350'}
			],
			'callback': changeData
		}
	]
	
	createDemoMenu(demoOptions, 600, 600, 'Vizuly - Radial Progress', styles);
}
