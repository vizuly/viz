// html element that holds the chart
var viz_container;

var styles = {
	'background-opacity': 0,
	'background-color-top': "#00F",
	'background-color-bottom': "#00F",
	'series-line-stroke': '#00F',
	'series-line-stroke-over': {'series-line-stroke-over': '#FF0', 'series-line-stroke': '#FF0'},
	'series-line-opacity': 0,
	'series-line-opacity-over': {'series-line-opacity-over': 0, 'series-line-opacity': 0},
	'series-area-fill': '#00F',
	'series-area-fill-over': {'series-area-fill-over': '#FF0', 'series-area-fill': '#FF0'},
	'series-area-fill-opacity': 0,
	'series-area-fill-opacity-over': {'series-area-fill-opacity-over': 0, 'series-area-fill-opacity': 0},
	'series-bar-fill': '#00F',
	'series-bar-fill-over':  {'series-bar-fill-over': '#FF0', 'series-bar-fill': '#FF0'},
	'series-bar-fill-opacity': 0,
	'series-bar-stroke': '#00F',
	'series-bar-stroke-over': {'series-bar-stroke-over': '#FF0', 'series-bar-stroke': '#FF0', 'series-bar-opacity': .8},
	'series-bar-stroke-opacity': 1,
	'series-bar-stroke-opacity-over': {'series-bar-stroke-over': '#FF0', 'series-bar-stroke': '#FF0'},
	'series-scatter-fill': '#00F',
	'series-scatter-fill-over':  {'series-scatter-fill-over': '#FF0', 'series-scatter-fill': '#FF0'},
	'series-scatter-fill-opacity': 1,
	'series-scatter-fill-opacity-over': {'series-scatter-fill-opacity-over': 1, 'series-scatter-fill-opacity': 1},
	'series-scatter-stroke': '#00F',
	'series-scatter-stroke-over': {'series-scatter-stroke-over': '#FF0', 'series-scatter-stroke': '#FF0'},
	'series-scatter-stroke-opacity': 1,
	'series-scatter-stroke-opacity-over': {'series-scatter-stroke-opacity-over': 1, 'series-scatter-stroke-opacity': 1},
	'axis-font-size': 20,
	'axis-font-weight': 'bold',
	'axis-label-color': '#00F',
	'axis-stroke': "#00F",
	'axis-stroke-opacity': 1,
	'tick-stroke':  {'tick-stroke': '#00F', 'tick-stroke-opacity': 1},
	'tick-stroke-opacity': 1,
	'series-label-color': '#00F',
	'series-label-font-size': 20,
	'series-label-font-weight': 'bold',
	'series-label-text-transform': 'lowercase',
	'series-arc-fill':  {'series-arc-fill': '#00F', 'series-arc-fill-opacity': 0.5},
	'series-arc-fill-opacity': 0.5,
	'gutter-fill': '#00F',
	'gutter-fill-opacity': 0.5,
	'ring-background-fill': '#00F',
	'ring-background-fill-opacity': 1,
	'value-circle-fill': '#00F',
	'value-circle-stroke': '#00F',
	'x-label-tip-font-size': 20,
	'x-label-tip-color': '#00F',
	'x-label-tip-fill': '#00F',
	'x-label-tip-fill-opacity': 0.5
}

var tempScaleColorClimate=d3.scaleLinear().range(['#448AFF', '#448AFF', '#FFF000', '#FF0000']).domain([0, 60, 80, 100])
var tempScaleColorDark=d3.scaleLinear().range(['#448AFF', '#448AFF', '#0015BC', '#FF0000']).domain([0, 60, 80, 100])
var tempScaleColorOcean=d3.scaleLinear().range(['#FFF', '#FFF', '#FFF', '#FFF']).domain([0, 60, 80, 100])
var tempScaleColorGhost=d3.scaleLinear().range(['#333', '#333', '#AAA', '#FFF']).domain([0, 60, 80, 100])
var fireFunction = function (d) { return d.Acres };
var fireColor=d3.scaleLinear().range(['#FFC107', '#FF5252', '#E64A19']).domain([d3.min(data.calfire,fireFunction), d3.mean(data.calfire,fireFunction) * .8, d3.max(data.calfire, fireFunction) * .8])
var fireOpacity=d3.scaleLinear().range([.2, .8]).domain([d3.min(data.calfire,fireFunction), d3.max(data.calfire, fireFunction)])


var defaultTheme = {};

var climateTheme = {
	styles: {
	
	},
	props: {
	
	},
	series: [
		{
			 index: 0,
			 styles: {
				 'series-bar-fill': function (d, i, index) { return tempScaleColorClimate(d.TempMax) },
				 'series-bar-fill-opacity': 0.75
			 }
		},
		{
			index: 1,
			styles: {
				'series-area-fill': function (d, i, index) { return "url(#" + vizuly2.svg.gradient.radialFade(viz, '#000', [1, .25], [.8, 1]).attr("id") + ")"; },
				'series-area-fill-opacity': .7,
				'series-line-stroke-over': '#390ed5',
				'series-area-fill-over': '#E64A19'
			}
		},
		{
			index: 2,
			styles: {
				'series-bar-fill': function (d, i, index) { return ['#FDFF88','#FFE907','#FFC107','#FFA000','#E64A19'][index] },
				'series-bar-fill-opacity': .9,
				'series-bar-fill-over': '#000'
			}
		},
		{
			index: 3,
			styles: {
				'series-scatter-fill': function (d, i, index) { return fireColor(d.Acres) },
				'series-scatter-fill-over': '#F00',
				'series-scatter-fill-opacity': function (d) { return fireOpacity(d.Acres) },
				'series-scatter-fill-opacity-over': 1,
				'series-scatter-stroke': function (d, i, index) { return fireColor(d.Acres) },
				'series-scatter-stroke-over': '#000',
				'series-arc-fill': '#FFF',
				'series-arc-fill-opacity': 0.35
			}
		}
	]
}

var darkTheme = {
	styles: {
		'background-color-top': '#666',
		'background-color-bottom': '#000',
		'tick-stroke': '#FFF',
		'tick-stroke-opacity': 0.5,
		'ring-background-fill': '#000',
		'axis-stroke': '#FFF',
		'axis-label-color': '#FFF',
		'series-label-color': '#FFF',
		'x-label-tip-color': '#FFF',
		'x-label-tip-fill': '#448AFF',
		'value-line-stroke': '#FFF',
		'value-line-opacity': 0.8,
		'value-circle-fill': '#448AFF'
	},
	props: {
	
	},
	series: [
		{
			index: 0,
			styles: {
				'series-bar-stroke': 'none',
				'series-bar-fill': function (d, i, index) { return tempScaleColorDark(d.TempMax) },
				'series-bar-fill-opacity': 0.5,
			}
		},
		{
			index: 1,
			styles: {
				'series-area-fill': function (d, i, index) { return "url(#" + vizuly2.svg.gradient.radialFade(viz, '#448AFF', [.3, 1], [.85, 1]).attr("id") + ")"; },
				'series-area-fill-opacity': .9,
				'series-line-stroke-over': '#390ed5',
				'series-area-fill-over': '#03A9F4',
				'series-arc-fill': '#448AFF',
				'series-arc-fill-opacity': 0.1
			}
		},
		{
			index: 2,
			styles: {
				'series-bar-fill': function (d, i, index) { return ['#65DDF4', '#4CB3DF', '#5B9BF4', '#1E7DB9', '#236480'][index] },
				'series-bar-fill-opacity': .8,
				'series-bar-fill-over': '#000',
				'series-arc-fill': '#448AFF',
				'series-arc-fill-opacity': 0.15
			}
		},
		{
			index: 3,
			styles: {
				'series-scatter-fill': function (d, i, index) { return '#4564ff' },
				'series-scatter-fill-over': '#00F',
				'series-scatter-fill-opacity': function (d) { return fireOpacity(d.Acres) },
				'series-scatter-fill-opacity-over': 1,
				'series-scatter-stroke': function (d, i, index) { return '#36daff' },
				'series-scatter-stroke-over': '#FFF'
			}
		}
	]
}

var oceanTheme = {
	styles: {
		'background-color-top': '#001C4C',
		'background-color-bottom': '#1476CD',
		'tick-stroke': '#FFF',
		'tick-stroke-opacity': 0.2,
		'ring-background-fill': '#000',
		'axis-stroke': '#FFF',
		'axis-label-color': '#FFF',
		'series-label-color': '#FFF',
		'x-label-tip-color': '#000',
		'x-label-tip-fill': '#FFF',
		'value-line-stroke': '#FFF',
		'value-line-opacity': 0.8,
		'value-circle-fill': '#E64A19',
		'value-circle-stroke': '#FAD2C5'
	},
	props: {
		'xTickLengthMajor' : function (d) { return (viz.size().outerRadius - viz.size().innerRadius) },
		'xTickLengthMinor' : function (d) { return (viz.size().outerRadius - viz.size().innerRadius) },
		'expandTicksOnHover': false
	},
	series: [
		{
			index: 0,
			styles: {
				'series-bar-stroke': 'none',
				'series-bar-fill': function (d, i, index) { return tempScaleColorOcean(d.TempMax) },
				'series-bar-fill-opacity': 0.5
			}
		},
		{
			index: 1,
			styles: {
				'series-area-fill': function (d, i, index) { return "url(#" + vizuly2.svg.gradient.radialFade(viz, '#FFF', [1, .25], [.8, 1]).attr("id") + ")"; },
				'series-area-fill-opacity': .7,
				'series-line-stroke-over': '#390ed5',
				'series-area-fill-over': '#E64A19'
			}
		},
		{
			index: 2,
			styles: {
				'series-bar-fill': function (d, i, index) { return '#FFF' },
				'series-bar-fill-opacity': function (d, i, index) { return [0.1, 0.2, 0.4, 0.6, 0.8][index] },
				'series-bar-fill-over': '#E64A19',
				'series-bar-stroke-over': '#E64A19',
				'series-bar-stroke-over-opacity': .8
			}
		},
		{
			index: 3,
			styles: {
				'series-scatter-fill': function (d, i, index) { return '#FFF' },
				'series-scatter-fill-over': '#E64A19',
				'series-scatter-fill-opacity': function (d) { return fireOpacity(d.Acres) },
				'series-scatter-fill-opacity-over': 1,
				'series-scatter-stroke': function (d, i, index) { return '#FFF' },
				'series-scatter-stroke-over': '#FFF'
			}
		}
	]
}

var ghostTheme = {
	styles: {
	  'background-color-top': '#555',
		'background-color-bottom': '#000',
		'tick-stroke': '#FFF',
		'tick-stroke-opacity': 0.2,
		'ring-background-fill': '#000',
		'axis-stroke': '#FFF',
		'axis-label-color': '#FFF',
		'series-label-color': '#FFF',
		'x-label-tip-color': '#000',
		'x-label-tip-fill': '#FFF',
		'value-line-stroke': '#FFF',
		'value-line-opacity': 0.8,
		'value-circle-fill': '#E64A19',
		'value-circle-stroke': '#FAD2C5'
	},
	props: {
		'xTickLengthMajor' : function (d) { return (viz.size().outerRadius - viz.size().innerRadius) },
		'xTickLengthMinor' : function (d) { return (viz.size().outerRadius - viz.size().innerRadius) },
		'expandTicksOnHover': false
	},
	series: [
		{
			index: 0,
			styles: {
				'series-bar-stroke': 'none',
				'series-bar-fill': function (d, i, index) { return tempScaleColorGhost(d.TempMax) },
				'series-bar-fill-opacity': 0.5
			}
		},
		{
			index: 1,
			styles: {
				'series-area-fill': function (d, i, index) { return "url(#" + vizuly2.svg.gradient.radialFade(viz, '#FFF', [1, .25], [.8, 1]).attr("id") + ")"; },
				'series-area-fill-opacity': .7,
				'series-line-stroke-over': '#390ed5',
				'series-area-fill-over': '#E64A19'
			}
		},
		{
			index: 2,
			styles: {
				'series-bar-fill': function (d, i, index) { return '#FFF' },
				'series-bar-fill-opacity': function (d, i, index) { return [0.1, 0.2, 0.4, 0.6, 0.8][index] },
				'series-bar-fill-over': '#E64A19',
				'series-bar-stroke-over': '#E64A19',
				'series-bar-stroke-over-opacity': .8
			}
		},
		{
			index: 3,
			styles: {
				'series-scatter-fill': function (d, i, index) { return '#FFF' },
				'series-scatter-fill-over': '#E64A19',
				'series-scatter-fill-opacity': function (d) { return fireOpacity(d.Acres) },
				'series-scatter-fill-opacity-over': 1,
				'series-scatter-stroke': function (d, i, index) { return '#FFF' },
				'series-scatter-stroke-over': '#FFF'
			}
		}
	]
}


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.width(s[0]).height(s[1]).update();
}

function changeTheme(val) {
	
	clearViz();
	
	if (this[val] == defaultTheme) {
		viz.update();
		return;
	}
	
	var props = this[val].props;
	
	Object.keys(props).forEach(function (key) {
		viz[key](props[key]);
	})
	
	var series = this[val].series;

	viz.series().forEach(function (vizSeries, i) {
		vizSeries.styles = series[i].styles;
	})
	
	var styles = this[val].styles;
	
	viz.applyStyles(styles);
	viz.update();
}

function clearViz() {
	viz.clearStyles();
	viz.series().forEach(function (series) {
		series.styles = {};
	})
	
	viz
	 .xTickLengthMajor(function (d) { return (viz.size().outerRadius - viz.size().innerRadius) * .04; })
	 .xTickLengthMinor(function (d) { return (viz.size().outerRadius - viz.size().innerRadius) * .02; })
	 .expandTicksOnHover(true);
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
				{'label': 'Default', value: 'defaultTheme'},
				{'label': 'Climate', 'value': 'climateTheme', 'selected': true},
				{'label': 'Dark', 'value': 'darkTheme'},
				{'label': 'Ocean', 'value': 'oceanTheme'},
				{'label': 'Ghost', 'value': 'ghostTheme'}
			],
			'callback': changeTheme
		},
	]
	
	createDemoMenu(demoOptions, 600, 600, 'vizuly - RingChart', styles);
	changeTheme('climateTheme');
	
}

