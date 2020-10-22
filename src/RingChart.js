/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 This source code is covered under the following license: http://vizuly.io/commercial-license/
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.236

/**
 * @class
 */
vizuly2.viz.RingChart = function (parent) {
	
	var d3 = vizuly2.d3;
	
	/** @lends vizuly2.viz.RingChart.properties */
	var properties = {
		/**
		 * Array of `series` objects.
		 *
		 *
		 * `series.plotRatio` - Float represents percentage of radius to be used for series ring radius - REQUIRED
		 *
		 * `series.plotType` - String representing plot type. REQUIRED
		 *
		 *       viz.PLOT_BAR_STACKED, viz.PLOT_LINE_AREA, viz.PLOT_SCATTER
		 *
		 * `series.x` - Functor that returns x(angle) position of datum.  REQUIRED
		 *
		 * `series.y` - Functor that returns y(radial) position of datum. REQUIRED
		 *
		 * `series.dataTipLabels` - Functor that returns 3 element array for 3 data tip label values - OPTIONAL
		 *
		 * `series.styles` - Object that contains any "series-.." styles to be overriden for this series - OPTIONAL
		 *
		 * `series.valueRange` - Functor that returns array [min, max] of y values to be used in plot scale. - OPTIONAL
		 *
		 * @member {Array}
		 * @param {Functor} series.x
		 * @default Needs to be set at runtime
		 *
		 * @example
		 *
		 *
		 * var tempSeries = {};
		 * tempSeries.data = laTemps;
		 * tempSeries.label = 'Temps';
		 * tempSeries.x = function (d, i) { return d.Date; };
		 * tempSeries.y = function (d) { return [d.TempMax] };
		 * tempSeries.plotType = viz.PLOT_BAR_STACKED;
		 * tempSeries.valueRange =  function (series) {
		 *  return [
		 *   d3.min(series.data, function (d, i) { return d3.sum(series.y(d, i))}),
		 *   d3.max(series.data, function (d, i) { return d3.sum(series.y(d, i))})
		 *  ]
		 * };
		 * tempSeries.plotRatio = .35;
		 * tempSeries.dataTipLabels = function (d, datum, index) {
		 *  return [
		 *   'Low: ' + d3.format(',')(Math.round(datum.TempMin)) + '°F',
		 *   'High: ' + d3.format(',')(Math.round(datum.TempMax)) + '°F',
		 *   d3.timeFormat('%b %d, %Y')(datum.Date)
		 *  ]
		 * }
		 * tempSeries.styles = {
		 *  'series-bar-fill': function (d, i, index) { return tempScaleColorClimate(d.TempMax) },
		 *  'series-bar-fill-opacity': 0.5
		 * }
		 *
		 * var pollutionSeries = {};
		 * pollutionSeries.data = pollution;
		 * pollutionSeries.label = 'Pollution';
		 * pollutionSeries.x = function (d, i) { return d.Date; };
		 * pollutionSeries.y = function (d) { return d.AQI };
		 * pollutionSeries.plotType = viz.PLOT_LINE_AREA
		 * pollutionSeries.plotRatio = .2;
		 * pollutionSeries.dataTipLabels = function (d, datum, i) {
		 *  return [
		 *   'Particulate: ' + d3.format(',.2f')(datum.PM2_5),
		 *   'Air Quality Index: ' + d3.format(',.2f')(datum.AQI),
		 *   d3.timeFormat('%b %Y')(datum.Date)
		 *  ]
		 * }
		 * pollutionSeries.styles = {
		 *   'series-area-fill': function (d, i, index) {
		 *     return "url(#" + vizuly2.svg.gradient.radialFade(viz, '#000', [1, .25], [.8, 1]).attr("id") + ")";
		 *   },
		 *   'series-area-fill-opacity': .7,
		 *   'series-line-stroke-over': '#390ed5',
		 *   'series-area-fill-over': '#E64A19'
		 *  }
		 *
		 * viz.series([tempSeries, pollutionSeries])
		 *
		 *
		 */
		"series": null,
		/**
		 * Width of component in either pixels (Number) or percentage of parent container (XX%)
		 * @member {Number/String}
		 * @default 600
		 * @example
		 * viz.width(600) or viz.width('100%');
		 */
		'width': 600,
		/**
		 * Height of component in either pixels (Number) or percentage of parent container (XX%)
		 * @member {Number/String}
		 * @default 600
		 * @example
		 * viz.height(600) or viz.height('100%');
		 *
		 */
		'height': 600,
		/**
		 * Margins between component render area and border of container.  This can either be a fixed pixels (Number) or a percentage (%) of height/width.
		 * @member {Object}
		 * @default  {top:'5%', bottom:'5%', left:'5%', right:'5%'}
		 */
		'margin': {
			'top': '5%',
			'bottom': '5%',
			'left': '5%',
			'right': '5%'
		},
		/**
		 * Duration (in milliseconds) of any component transitions.
		 * @member {Number}
		 * @default  500
		 */
		'duration': 500,
		/**
		 * Determines the inner radius of the chart in either pixels (Number) or percentage of parent container (XX%)
		 * @member {Number/String}
		 * @default 100
		 *
		 */
		'innerRadius': 100,
		/**
		 * Determines the outer radius of the chart in either pixels (Number) or percentage of parent container (XX%)
		 * @member {Number/String}
		 * @default 290
		 *
		 */
		'outerRadius': 290,
		/**
		 * Determines the radial angle of the gutter (where series labels are plotted) in degrees
		 * @member {Number}
		 * @default 30
		 *
		 */
		"gutterAngle": 30,
		/**
		 * Determines the spacing between ring series as a percentage of the outer radius
		 * @member {Number}
		 * @default .025
		 *
		 */
		"ringPadding": .025,
		/**
		 * Functor that returns an [min, max] array as a range of dates to be plotted.  This allows you plot time series that may have different start/end dates and clamp them by a given a range.
		 * @member {Functor}
		 * @default function () { return [d3.min(scope.series[0].data, function (d) { return scope.series[0].x(d)}), d3.max(scope.series[0].data, function (d) { return scope.series[0].x(d)})]},
		 *
		 */
		"dateRange": function () { return [d3.min(scope.series[0].data, function (d) { return scope.series[0].x(d)}), d3.max(scope.series[0].data, function (d) { return scope.series[0].x(d)})]},
		/**
		 * Determines what granularity to reneder elements along radial axis (i.e. Bar width thickness etc..)
		 * @member {d3.timeWeek, d3.timeDay, etc.}
		 * @default d3.timeWeek
		 */
		"timeGrain": d3.timeWeek,
		/**
		 * Label formatter for the x axis.  Can be customized to modify labels along axis.
		 * @member {function}
		 * @default function (d) { return d }
		 * @example
		 * //Sets each axis tick label to a date month/year format.
		 * viz.xTickFormat(function (d) { return d3.timeFormat('%m/%y')(d)} })
		 */
		'xTickFormat': function (d) { return d3.timeFormat('%m/%y')(d)},
		/**
		 * D3 Axis used to render x (radial) axis.  This axis can be overriden with custom settings by capturing the 'measure' event.
		 * @member {d3.axis}
		 * @default d3.axisBottom
		 * @example
		 * viz.on('measure', function () { viz.xAxis().tickSize(10) }) //Sets each axis tick to 10 pixels
		 */
		"xAxis": d3.axisBottom(),
		/**
		 * Determines the length of major ticks
		 * @member {Functor}
		 * @default function (d) { return (outerRadius - innerRadius) * .04 }
		 *
		 */
		"xTickLengthMajor": function (d) { return (outerRadius - innerRadius) * .04 },
		/**
		 * Determines the length of minor ticks
		 * @member {Functor}
		 * @default function (d) { return (outerRadius - innerRadius) * .02; }
		 *
		 */
		"xTickLengthMinor": function (d) { return (outerRadius - innerRadius) * .02; },
		/**
		 * Format for x radial outer label on mouse hover
		 * @member {Functor}
		 * @default function (d) { return d3.timeFormat('%b %d, %Y')(d) }
		 *
		 */
		"xTickFormatHover": function (d) {
			return d3.timeFormat('%b %d, %Y')(d)
		},
		/**
		 * Number of major ticks to use on x-axis
		 * @member {Number}
		 * @default 10
		 *
		 */
		"xTickCount": 10,
		/**
		 * Number of minor ticks between major ticks on x-axis
		 * @member {Number}
		 * @default 8
		 *
		 */
		"xMinorTickCount": 8,
		/**
		 * True allows ticks marks to expand radially on mouse hover.  False keeps ticks stationary.
		 * @member {Number}
		 * @default true
		 *
		 */
		"expandTicksOnHover": true,
		/**
		 * Curve vertex type to use for LineArea series.
		 * @member {d3.curve}
		 * @default d3.curveBasisOpen
		 *
		 */
		"lineAreaCurve": d3.curveBasisOpen,
		/**
		 *  The dataTipRenderer is used to customize the data tip that is shown on mouse-over events.
		 *  You can append to or modify the 'tip' parameter to customize the data tip.
		 *  You can also return modified x, y coordinates to place the data tip in a different location.
		 *
		 *  CAUTION: The default datatip is designed to work with series.dataTipLabels.  Be sure to factor
		 *  that into any custom datatips you may create.
		 * @member {function}
		 * @default internal.dataTipRenderer
		 * @example
		 * // tip - html DIV element
		 * // e - svg rect of the bar being moused over
		 * // d - datum
		 * // i - datum index
		 * // j - group index (optional)
		 * // x - suggested x position of data tip
		 * // y - suggested y position of data tip
		 * // return {Array} [x, y] - x and y coordinates placing data tip.
		 *
		 *function dataTipRenderer(tip, e, d, i, x, y) {
		 *  if (!d.series.dataTipLabels) return false;
		 *
		 *  var bounds = e.getBoundingClientRect();
		 *  var x1 = d3.event.pageX; //- bounds.left;
		 *  var y1 = d3.event.pageY; //- bounds.top;
		 *
		 *  var tipLabels = d.series.dataTipLabels(d, d.data, i)
		 *
		 *  var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 *	'<div class="vz-tip-header-rule"></div>' +
		 *	'<div class="vz-tip-header2"> HEADER2 </div>' +
		 *	'<div class="vz-tip-header-rule"></div>' +
		 *	'<div class="vz-tip-header1"> HEADER3 </div>';
		 *
		 *  html = html.replace("HEADER1", tipLabels[0]);
		 *  html = html.replace("HEADER2", tipLabels[1]);
		 *  html = html.replace("HEADER3", tipLabels[2]);
		 *
		 *  tip.html(html);
		 *
		 *  return [x1 - 100, y1 - 150 - (d.series.plotType == viz.PLOT_BAR_STACKED ? 40 : 0)];
		 *}
		 */
		"dataTipRenderer": dataTipRenderer,
	};
	
	var styleColors =['#f00a0a', '#F57C00', '#FF9800', '#FFEB3B', '#C2185B']; //['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B']; //['#f00a0a', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'];
	
	var styles = {
		'background-opacity': 1,
		'background-color-top': "#FFF",
		'background-color-bottom': "#DDD",
		'series-line-stroke': function (d, i) {
			var colors = styleColors;
			return colors[i % colors.length];
		},
		'series-line-stroke-over': function (d, i, j, seriesIndex) {
			var series = scope.series[seriesIndex]
			return getSeriesStyle(series, 'series-line-stroke', [series.data, i, j, seriesIndex])
		},
		'series-line-opacity': .8,
		'series-line-opacity-over': .9,
		'series-area-fill': function (d, i) {
			var colors = styleColors;
			return "url(#" + vizuly2.svg.gradient.radialFade(viz, colors[i % colors.length], [.25, 1], [.8, 1]).attr("id") + ")";
		},
		'series-area-fill-over': function (d, i, j, seriesIndex) {
			var series = scope.series[seriesIndex]
			return getSeriesStyle(series, 'series-area-fill', [series.data, i, j, seriesIndex])
		},
		'series-area-fill-opacity': .8,
		'series-area-fill-opacity-over': 1,
		'series-bar-fill': function (d,i,j) {
			var colors = styleColors;
			return colors[i % colors.length];
		},
		'series-bar-fill-over': function (d, i, j, seriesIndex) {
			var series = scope.series[seriesIndex]
			return getSeriesStyle(series, 'series-bar-fill', [series.data, i, j, seriesIndex])
		},
		'series-bar-fill-opacity': .75,
		'series-bar-stroke': 'none',
		'series-bar-stroke-over': function (d, i, j, seriesIndex) {
			var series = scope.series[seriesIndex]
			return getSeriesStyle(series, 'series-bar-stroke', [series.data, i, j, seriesIndex])
		},
		'series-bar-stroke-opacity': .8,
		'series-bar-stroke-opacity-over':  function (d, i, j, seriesIndex) {
			var series = scope.series[seriesIndex]
			getSeriesStyle(series, 'series-bar-stroke-opacity', [series.data, i, j, seriesIndex])
		},
		'series-scatter-fill': function (d, i) {
			var colors = styleColors;
			return colors[i % colors.length];
		},
		'series-scatter-fill-over':  function (d, i, j, seriesIndex) {
			var series = scope.series[seriesIndex];
			getSeriesStyle(series, 'series-scatter-fill', [series.data, i, j, seriesIndex])
		},
		'series-scatter-fill-opacity': function (d, i) {
			return 0.5;
		},
		'series-scatter-fill-opacity-over':  function (d, i, j, seriesIndex) {
			var series = scope.series[seriesIndex]
			getSeriesStyle(series, 'series-scatter-fill-opacity', [series.data, i, j, seriesIndex])
		},
		'series-scatter-stroke': function (d, i) {
			var colors = styleColors;
			return colors[i % colors.length];
		},
		'series-scatter-stroke-over': function (d, i, j, seriesIndex) {
			var series = scope.series[seriesIndex]
			getSeriesStyle(series, 'series-scatter-stroke', [series.data, i, j, seriesIndex])
		},
		'series-scatter-stroke-opacity': 0.5,
		'series-scatter-stroke-opacity-over':function (d, i, j, seriesIndex) {
			var series = scope.series[seriesIndex]
			getSeriesStyle(series, 'series-scatter-stroke-opacity', [series.data, i, j, seriesIndex])
		},
		'axis-font-size': function () {
			return Math.max(10, Math.round(radiusScale.range()[1] / 35));
		},
		'axis-font-weight': 'normal',
		'axis-label-color': '#888',
		'axis-stroke': "#777",
		'axis-stroke-opacity': .25,
		'tick-stroke': '#000',
		'tick-stroke-opacity': .3,
		'series-label-color': '#000',
		'series-label-font-size': function () {
			return Math.max(10, Math.round(radiusScale.range()[1] / 30));
		},
		'series-label-font-weight': 'normal',
		'series-label-text-transform': 'uppercase',
		'series-arc-fill': '#FFF',
		'series-arc-fill-opacity': 0,
		'gutter-fill': '#777',
		'gutter-fill-opacity': 0.05,
		'ring-background-fill': '#FFF',
		'ring-background-fill-opacity': 0.15,
		'value-line-stroke': '#000',
		'value-line-opacity': .5,
		'value-circle-fill': '#000',
		'value-circle-stroke': '#FFF',
		'x-label-tip-font-size': function () {
			return Math.max(9, Math.round(radiusScale.range()[1] / 25));
		},
		'x-label-tip-color': '#FFF',
		'x-label-tip-fill': '#000',
		'x-label-tip-fill-opacity': 0.8
	};
	
	/** @lends vizuly2.viz.RingChart.events */
	var events = [
		/**
		 * Fires when user moves the mouse over a bar.
		 * @event vizuly2.viz.RingChart.mouseover
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseover', function (e, d, i) { ... });
		 */
		'mouseover',
		/**
		 * Fires when user moves the mouse off a bar.
		 * @event vizuly2.viz.RingChart.mouseout
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseout', function (e, d, i) { ... });
		 */
		'mouseout',
		/**
		 * Fires when user clicks a bar.
		 * @event vizuly2.viz.RingChart.click
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('click', function (e, d, i) { ... });
		 */
		'click'
	]
	
	
	// This is the object that provides pseudo "protected" properties that the vizuly.viz function helps create
	var scope = {};
	scope.initialize = initialize;
	scope.properties = properties;
	scope.styles = styles;
	scope.events = events;
	
	// Create our Vizuly component
	var viz = vizuly2.core.component(parent, scope);
	viz.version = '2.1.236';
	
	viz.PLOT_BAR_STACKED = 'BAR_STACKED';
	viz.PLOT_LINE_AREA = 'LINE_AREA';
	viz.PLOT_SCATTER = 'SCATTER';
	
	var size;                           // Holds the 'size' variable as defined in viz.util.size()
	var xAxisTickStep;                  // The number of data points between each xAxis tick
	var xAxisTickData;                  // Holds the ticks generated by the d3.axis
	var gutter;
	var ringBackground;
	var seriesBackground;
	
	var stack;                          // used for the stacking layout for the lines and area
	var stackSeries;                    // Holds transformed stack data.
	var innerRadius;
	var outerRadius;
	var radiusStep;
	
	var line = d3.radialLine();    // d3 line path generator for our RADIAL lines
	var area = d3.radialArea();    // d3 area path generator for our RADIAL areas
	var lineAreaScale = d3.scaleOrdinal();
	var barArc = d3.arc();
	var gutterArc = d3.arc();
	var ringArc = d3.arc();
	var labelArc = d3.arc();
	var seriesArc = d3.arc();
	var radiusScale = d3.scaleLinear();
	var seriesPlots = [];
	var xScale = d3.scaleTime();
	var lineAreaPlots, barPlots, scatterPlots;
	var barTheta, startAngle, endAngle;
	var xLabelRadius = 1.025;
	var padding;
	
	var seriesProps = ['data','x','y','plotType', 'plotRatio'];
	
	//These are all d3.selection objects we use to insert and update svg elements into
	var svg, defs, g, xAxisPlot, yAxisPlot, plot, background, plotBackground, series;
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the individual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as D3 selections.
	function initialize() {
		
		svg = scope.selection.append('svg').attr('id', scope.id).style('overflow', 'visible').attr('class', 'vizuly');
		background = svg.append('rect').attr('class', 'vz-background');
		defs = vizuly2.util.getDefs(viz);
		g = svg.append('g').attr('class', 'vz-ring-viz');
		xAxisPlot = g.append('g').attr('class', 'vz-xAxis-plot');
		plot = g.append('g').attr('class', 'vz-plot') //.attr('clip-path', 'url(#' + scope.id + '_plotClipPath)')
		 .on('mousemove',plotOnMouseMove)
		 .on('mouseout',plotOnMouseOut)
		plotBackground = plot.append('rect').attr('class', 'vz-plot-background');
		ringBackground = plot.append('path').attr('class','vz-ring-background').style('pointer-events','none');
		seriesBackground = plot.append('g').attr('class','vz-ring-series-background').style('pointer-events','none');
		gutter = plot.append('path').attr('class','vz-ring-gutter').style('pointer-events','none');
		series = plot.append('g').attr('class', 'vz-series')
		yAxisPlot = g.append('g').attr('class', 'vz-yAxis-plot').style('pointer-events','none');
		
		scope.xAxis.tickFormat(function (d) {
			return d
		});
		
		// Tell everyone we are done initializing.
		scope.dispatch.apply('initialized', viz);
	}
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Validate series properties
		scope.series.forEach(function (s, i) {
			seriesProps.forEach(function (prop) {
				if (!s[prop]) {
					console.log("WARNING: Series[" + i  + "] does not have a declaration for property '" + prop + "'.")
				}
			})
		})
		
		// Get our size based on height, width, and margin
		size = vizuly2.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		var theta = scope.gutterAngle * Math.PI/180;
		startAngle = theta/2;
		endAngle = (360 * Math.PI/180) - theta/2;
		
		var xDomain = scope.dateRange()
		
		// Set our theta scale and range (or range bands) depending on scale type.
		xScale.range([startAngle, endAngle]);
		xScale.domain(xDomain);
		
		if (size.measuredWidth < size.measuredHeight) {
			innerRadius = vizuly2.util.getRelativeWidth(scope.innerRadius, scope.selection.node()) - (size.left + size.right)/2;
			outerRadius = vizuly2.util.getRelativeWidth(scope.outerRadius, scope.selection.node()) - (size.left + size.right)/2;
		}
		else {
			innerRadius = vizuly2.util.getRelativeHeight(scope.innerRadius, scope.selection.node()) - (size.top + size.bottom)/2;
			outerRadius = vizuly2.util.getRelativeHeight(scope.outerRadius, scope.selection.node()) - (size.top + size.bottom)/2;
		}
		
		lineAreaPlots = [];
		barPlots = [];
		scatterPlots = [];
		var ir = innerRadius;
		var irStep;
		
		seriesPlots = [];
		
		var timeCount = scope.timeGrain.count(xDomain[0], xDomain[1]);
		console.log("Time Count = " + timeCount)
		var barTheta = (360 - scope.gutterAngle)/(timeCount);
		padding = (outerRadius-innerRadius) * scope.ringPadding;
		
		barTheta = Math.max(barTheta, 1) * Math.PI/180;
		
		scope.series.forEach(function (series, seriesIndex) {
			
			var valueDomain = (series.valueRange) ? series.valueRange(series) : [d3.min(series.data, function (d, i) { return series.y(d, i) }),d3.max(series.data, function (d, i) { return series.y(d, i) })];
			
			var seriesData = series.data.filter(function (d, i) { return series.x(d, i) >= xDomain[0] && series.x(d, i) <= xDomain[1]})
			
			irStep = (outerRadius-innerRadius - padding * scope.series.length) * series.plotRatio;
			
			var sr = {};
			sr.innerRadius = ir;
			sr.outerRadius = ir + irStep + ((seriesIndex < scope.series.length-1) ? padding : 0);
			sr.padding = padding;
			sr.series = series;
			seriesPlots.push(sr);
			
			radiusScale
			 .domain(valueDomain)
			 .range([ir, ir + irStep]);
			
			var plot = [];
			plot.series = series;
			var plotType = series.plotType;
			
			if (plotType === viz.PLOT_LINE_AREA) {
				var scale = (series.scale) ? series.scale : d3.scaleLinear();
				
				plot.type = viz.PLOT_LINE_AREA;
				plot.data = seriesData;
				plot.series = series;
				plot.seriesIndex = seriesIndex;
				plot.seriesScale = d3.scaleLinear().range([startAngle, endAngle])
				plot.seriesScale.range([0, plot.data.length-1]);
				
				scale
				 .domain(valueDomain)
				 .range([ir, ir + irStep]);
				
				xScale.range([startAngle, endAngle])
				
				seriesData.forEach(function (d, i) {
					var datum = {};
					datum.type = viz.PLOT_LINE_AREA;
					datum.data = d;
					datum.index = i;
					datum.series = series;
					datum.seriesIndex = seriesIndex;
					datum.angle = xScale(series.x(d));
					datum.innerRadius = ir;
					datum.outerRadius = radiusScale(series.y(d, i));
					plot.push(datum);
				})
				
				plot.seriesScale.domain([d3.min(plot, function (d) { return d.angle }), d3.max(plot, function (d) { return d.angle })]);
				
				lineAreaPlots.push(plot)
			}
			else if (plotType === viz.PLOT_BAR_STACKED) {
				
				var scale = (series.scale) ? series.scale : d3.scaleLinear();
				scale
				 .range([0, irStep])
				 .domain(valueDomain);
				
				xScale.range([startAngle, endAngle - barTheta])
				
				
				var plots = [];
				seriesData.forEach(function (d, i) {
					var currR = ir;
					var datums = series.y(d, i);
					datums.forEach(function (value, index) {
						var plot = {};
						plot.type = viz.PLOT_BAR_STACKED;
						plot.data = d;
						plot.index = index;
						plot.series = series;
						plot.stackCount = datums.length;
						plot.seriesIndex = seriesIndex
						plot.angle = xScale(series.x(d, i));
						plot.startAngle = plot.angle
						plot.endAngle = plot.angle + barTheta;
						plot.innerRadius = currR;
						currR+= scale(value);
						plot.outerRadius = currR;
						plots.push(plot);
					})
				})
				barPlots.push(plots);
			}
			else if (plotType === viz.PLOT_SCATTER) {
				var plots = [];
				var scale = (series.scale) ? series.scale : d3.scaleLinear();
				scale
				 .range([2, irStep/2 - padding/2])
				 .domain(valueDomain)
				
				xScale.range([startAngle, endAngle - barTheta])
				
				plots.type = viz.PLOT_SCATTER;
				plots.series = series;
				plots.seriesIndex = seriesIndex;
				
				seriesData.forEach(function (d, index) {
					var plot = {};
					plot.type = viz.PLOT_SCATTER;
					plot.data = d;
					plot.series = series;
					plot.index = index;
					plot.seriesIndex = seriesIndex;
					plot.angle = xScale(series.x(d, index));
					plot.radius = ir + irStep/2;
					plot.x = Math.cos(plot.angle - (90 * Math.PI/180)) * plot.radius;
					plot.y = Math.sin(plot.angle - (90 * Math.PI/180)) * plot.radius;
					plot.r = scale(series.y(d, index));
					plots.push(plot);
				})
				scatterPlots.push(plots);
			}
			ir+= irStep + padding;
			
		});
		
		//Sort scatter plots by radius so biggest are rendered first
		scatterPlots.forEach(function (plot) {
			plot.sort(function (a,b) {
				return a.r < b.r
			})
		})
		
		ringArc
		 .innerRadius(innerRadius)
		 .outerRadius(outerRadius)
		 .startAngle(startAngle)
		 .endAngle(endAngle);
		
		seriesArc
		 .startAngle(startAngle)
		 .endAngle(endAngle);
		
		gutterArc
		 .innerRadius(innerRadius)
		 .outerRadius(outerRadius)
		 .startAngle(-startAngle + (2 * Math.PI/180))
		 .endAngle(startAngle - (2 * Math.PI/180));
		
		barArc
		 .innerRadius(function(d, i) { return d.innerRadius; })
		 .outerRadius(function(d, i) { return d.outerRadius })
		 .startAngle(function(d, i) { return d.startAngle })
		 .endAngle(function(d, i) { return d.endAngle })
		 .padAngle(0.01)
		 .padRadius(function (d,i) { return d.innerRadius })
		
		// Set our radius scale range
		radiusScale.range([innerRadius, outerRadius]);
		
		radiusStep = Math.round((outerRadius-innerRadius)/scope.series.length);
		
		// Set our area path generator properties
		area.curve(scope.lineAreaCurve)
		 .angle(function (d) { return d.angle })
		 .innerRadius(function (d, i) { return d.innerRadius; })
		 .outerRadius(function (d, i) { return d.outerRadius; });
		
		// Set our line path generator properties
		line.curve(scope.lineAreaCurve)
		 .angle(function (d) {
			 return d.angle
		 })
		 .radius(function (d, i) {
			 return d.outerRadius;
		 });
		
		scope.xAxis
		 .scale(xScale)
		 .ticks(scope.xTickCount)
		 .tickFormat(scope.xTickFormat);
		
		size.outerRadius = outerRadius;
		size.innerRadius = innerRadius;
		scope.size = size;
		
		// Tell everyone we are done measuring.
		scope.dispatch.apply('measured', viz);
		
	}
	
	// The update function is the primary function that is called when we want to render the visualiation based on
	// all of its set properties.  A developer can change propertys of the components and it will not show on the screen
	// until the update function is called
	function update() {
		
		// Call measure each time before we update to make sure all our our layout properties are set correctly
		measure();
		
		// Layout all of our primary SVG d3 elements.
		svg.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		background.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		ringBackground.attr('d',ringArc());
		gutter.attr('d',gutterArc());
		plot.style("width", size.width).style("height", size.height).attr("transform", "translate(" + (size.left + size.width/2) + "," + (size.top + size.height / 2) + ")");
		xAxisPlot.attr("transform", "translate(" + (size.left + size.width / 2) + "," + (size.height / 2 + size.top) + ")");
		yAxisPlot.attr("transform", "translate(" + (size.left + size.width / 2) + "," + (size.height / 2 + size.top) + ")");
		plotBackground.attr("width", size.width).attr("height", size.height).attr("transform", "translate(" + (- size.width / 2) + "," + (- size.height / 2) + ")").style('fill','#FFF').style('opacity',0.01)
		
		var seriesArea = series.selectAll(".vz-ring-area").data(lineAreaPlots);
		seriesArea.exit().remove();
		seriesArea = seriesArea.enter()
		 .append("path")
		 .attr("class", "vz-ring-area")
		 .on("mousemove", lineAreaMouseMove)
		 .on("å", lineAreaMouseOver)
		 .on("mouseout", lineAreaMouseOut)
		 .on("click", lineAreaClick)
		 .merge(seriesArea)
		
		seriesArea
		 .attr("d", area)
		
		
		var seriesLine = series.selectAll(".vz-ring-line").data(lineAreaPlots);
		seriesLine.exit().remove();
		seriesLine = seriesLine.enter()
		 .append("path")
		 .attr("class", "vz-ring-line")
		 .style("fill", "none")
		 .merge(seriesLine)
		
		seriesLine
		 .attr("d", line);
		
		
		var plots = [];
		barPlots.forEach(function (plot) {
			plot.forEach(function (d) {
				plots.push(d);
			})
		})
		
		
		var bars = series.selectAll(".vz-ring-bar").data(plots);
		bars.exit().remove();
		bars = bars.enter()
		 .append("path")
		 .attr("class", "vz-ring-bar")
		 .on("mousemove", function (d, i) {
			 scope.dispatch.apply('mouseover', viz, [this, d, i]);
		 })
		 .on("mouseover", function (d, i) {
			 scope.dispatch.apply('mouseover', viz, [this, d, i]);
		 })
		 .on("touchstart", function (d, i) {
			 scope.dispatch.apply('mouseover', viz, [this, d, i]);
		 })
		 .on("mouseout", function (d, i) {
			 scope.dispatch.apply('mouseout', viz, [this, d, i]);
		 })
		 .on("click", function (d, i) {
			 scope.dispatch.apply('click', viz, [this, d, i]);
		 })
		 .merge(bars)
		
		bars
		 .attr('d', barArc)
		
		
		plots = [];
		scatterPlots.forEach(function (plot) {
			plot.forEach(function (d) {
				plots.push(d);
			})
		});
		
		
		var scatter = series.selectAll(".vz-ring-scatter").data(plots);
		scatter.exit().remove();
		scatter = scatter.enter()
		 .append('circle')
		 .attr('class', 'vz-ring-scatter')
		 .on("mouseover", function (d, i) {
			 scope.dispatch.apply('mouseover', viz, [this, d, i]);
		 })
		 .on("touchstart", function (d, i) {
			 scope.dispatch.apply('mouseover', viz, [this, d, i]);
		 })
		 .on("mouseout", function (d, i) {
			 scope.dispatch.apply('mouseout', viz, [this, d, i]);
		 })
		 .on("click", function (d, i) {
			 scope.dispatch.apply('click', viz, [this, d, i]);
		 })
		 .merge(scatter)
		
		scatter
		 .attr('cx',function (d) { return d.x })
		 .attr('cy',function (d) { return d.y })
		 .attr('r',function (d) { return d.r })
		
		radiusScale.range([innerRadius, outerRadius]).domain([0,scope.series.length])
		
		yAxisPlot.selectAll('.vz-y-axis-tick').remove();
		yAxisPlot.selectAll(".vz-y-axis-tick")
		 .data(seriesPlots)
		 .enter()
		 .append("circle")
		 .attr("class", "vz-y-axis-tick")
		 .attr("cx", 0)
		 .attr("cy", 0)
		 .attr("r", function (d,i) {
			 return d.innerRadius
		 })
		 .style("fill", "none");
		
		//Add last outer line
		yAxisPlot
		 .append("circle").attr("class", "vz-y-axis-tick")
		 .attr("cx", 0)
		 .attr("cy", 0)
		 .attr("r", outerRadius)
		 .style("fill", "none");
		
		
		xAxisPlot.selectAll('.vz-ring-x-tick, .x-axis-label, .x-axis-major-tick, x-axis-minor-tick').remove();
		
		for (var i=0; i < scope.xTickCount + 1; i++) {
			
			var g = xAxisPlot.append('g').attr('class','vz-ring-x-tick');
			
			g.append('text')
			 .attr('class','x-axis-label');
			
			g.append('line')
			 .attr('class','x-axis-major-tick');
			
			if (i < scope.xTickCount) {
				for (var j=1; j < scope.xMinorTickCount; j++) {
					g.append('line')
					 .attr('class','x-axis-minor-tick');
				}
			}
		}
		
		updateXAxis(xLabelRadius);
		updateTicks();
		
		//Series Arcs
		var seriesArcs = seriesBackground.selectAll('.vz-ring-series-arc').data(seriesPlots);
		
		seriesArcs.exit().remove();
		
		seriesArcs = seriesArcs.enter()
		 .append('path')
		 .attr('class','vz-ring-series-arc')
		 .merge(seriesArcs);
		
		seriesArcs.each(function (d,i) {
			var arc = d3.select(this);
			arc.attr('d',seriesArc)
		})
		
		//Series Labels
		var seriesLabels = yAxisPlot.selectAll('.vz-ring-series-label').data(seriesPlots);
		
		seriesLabels.exit().remove();
		
		seriesLabels = seriesLabels.enter()
		 .append('text')
		 .attr('class','vz-ring-series-label')
		 .merge(seriesLabels);
		
		seriesLabels.each(function (d,i) {
			var text = d3.select(this);
			var ir = (d.innerRadius + d.outerRadius)/2;
			createTextOnArc(text, d.series.label, scope.id + "_seriesLabel" + i, 'vz-ring-series-label', ir, 0)
		})
		
		// Let everyone know we are done updating.
		scope.dispatch.apply('updated', viz);
		
	}
	
	function updateXAxis(r) {
		
		var degreeOffset = (endAngle - startAngle)/scope.xTickCount;
		var minorOffset = Math.round(degreeOffset/scope.xMinorTickCount * 100)/100;
		
		xAxisPlot.selectAll('.vz-ring-x-tick').each(function (d,i) {
			
			var g = d3.select(this);
			var label = g.selectAll('text');
			var majorTick = g.selectAll('.x-axis-major-tick');
			var minorTick = g.selectAll('.x-axis-minor-tick');
			
			var angle = startAngle + (degreeOffset * i);
			var x = Math.cos(angle - 90 * Math.PI/180) * outerRadius * r;
			var y = Math.sin(angle - 90 * Math.PI/180) * outerRadius * r;
			
			var x1 = Math.cos(angle - 90 * Math.PI/180) * (outerRadius * .99) * r;
			var y1 = Math.sin(angle - 90 * Math.PI/180) * (outerRadius * .99) * r;
			var x2 = Math.cos(angle - 90 * Math.PI/180) * (outerRadius * .97) * r;
			var y2 = Math.sin(angle - 90 * Math.PI/180) * (outerRadius * .97) * r;
			
			var rotate = (angle * 180/Math.PI < 180) ? angle : angle + 180 * Math.PI/180;
			
			label
			 .style('alignment-baseline','middle')
			 .style('text-anchor',(angle * 180/Math.PI < 180) ? 'start' : 'end')
			 .text(scope.xTickFormat(xScale.invert(angle)))
			 .transition('xAxisLabel')
			 .duration(scope.duration)
			 .attr('transform','rotate(' + ((rotate * 180/Math.PI) - 90) + ',' + x + ',' + y + ')')
			 .attr('x',x)
			 .attr('y',y)
		})
	}
	
	function updateTicks(r) {
		
		if (!r) r = 1;
		var minorTickLength = scope.xTickLengthMinor();
		var majorTickLength = scope.xTickLengthMajor();
		var degreeOffset = (endAngle - startAngle)/scope.xTickCount;
		var minorOffset = Math.round(degreeOffset/scope.xMinorTickCount * 100)/100;
		
		
		xAxisPlot.selectAll('.vz-ring-x-tick').each(function (d,i) {
			var angle = startAngle + (degreeOffset * i);
			var g = d3.select(this);
			var majorTick = g.selectAll('.x-axis-major-tick');
			var minorTick = g.selectAll('.x-axis-minor-tick');
			
			var x1 = Math.cos(angle - 90 * Math.PI/180) * (outerRadius) * r;
			var y1 = Math.sin(angle - 90 * Math.PI/180) * (outerRadius) * r;
			var x2 = Math.cos(angle - 90 * Math.PI/180) * (outerRadius - majorTickLength) * r;
			var y2 = Math.sin(angle - 90 * Math.PI/180) * (outerRadius - majorTickLength) * r;
			
			
			majorTick
			 .transition('tick-expand')
			 .duration(scope.duration)
			 .attr('x1',x1)
			 .attr('x2',x2)
			 .attr('y1',y1)
			 .attr('y2',y2)
			
			
			minorTick.each(function (d,i) {
				var tick = d3.select(this)
				var a = angle + (minorOffset * (i + 1));
				var x1 = Math.cos(a - 90 * Math.PI/180) * (outerRadius) * r;
				var y1 = Math.sin(a - 90 * Math.PI/180) * (outerRadius) * r;
				var x2 = Math.cos(a - 90 * Math.PI/180) * (outerRadius - minorTickLength) * r;
				var y2 = Math.sin(a - 90 * Math.PI/180) * (outerRadius - minorTickLength) * r;
				
				tick
				 .transition('tick-expand')
				 .duration(scope.duration)
				 .attr('x1',x1)
				 .attr('x2',x2)
				 .attr('y1',y1)
				 .attr('y2',y2)
			})
			
		})
	}
	
	function getRadialAngle(e) {
		plot.selectAll('.vz-ring-series-value').remove();
		
		var bounds = plot.node().getBoundingClientRect();
		
		var center = [outerRadius, outerRadius];
		
		var leftPad = (size.left + (bounds.width - outerRadius * 2)/2);
		var topPad = (size.top + (bounds.height - outerRadius * 2)/2);
		
		var x = e.offsetX - leftPad;
		var y = e.offsetY - topPad;
		
		var rawAngle = Math.atan2(y - center[1], x - center[0]) * 180/Math.PI;
		
		var angle = (rawAngle > -90 && rawAngle < 180) ? rawAngle + 90 : rawAngle + 450;
		
		angle = angle * Math.PI/180;
		
		return {angle: angle, rawAngle: rawAngle};
	}
	
	var plotOver = false;
	function plotOnMouseMove() {
		
		var a = getRadialAngle(d3.event);
		var angle = a.angle;
		var rawAngle = a.rawAngle;
		
		defs.selectAll('.vz-tip-path').remove();
		plot.selectAll('.vz-label-tip').remove();
		plot.selectAll('.vz-ring-indicator').remove();
		
		if (!(angle > startAngle && angle < endAngle)) {
			return;
		}
		
		plot.append('circle')
		 .attr('class','vz-ring-indicator')
		 .attr('cx',0)
		 .attr('cy',0)
		 .attr('r',6)
		 .style("stroke",'#000')
		 .style('pointer-events','none')
		
		plot.append('line')
		 .attr('class','vz-ring-indicator')
		 .attr('x1', 0)
		 .attr('y1', 0)
		 .attr('x2', (Math.cos(rawAngle * Math.PI/180) * outerRadius))
		 .attr('y2', (Math.sin(rawAngle * Math.PI/180) * outerRadius))
		 .style('stroke-dasharray',(outerRadius * .02) + ',' + (outerRadius * .02))
		 .style('stroke',viz.getStyle('value-line-stroke',[]))
		 .style('opacity', viz.getStyle('value-line-opacity',[]))
		 .style('pointer-events','none')
		
		xScale.range([startAngle, endAngle]);
		
		var date = xScale.invert(angle);
		showXLabel(date);
		showSeriesValues(angle);
		
		if (plotOver == true) return;
		
		updateXAxis(1.115);
		if (scope.expandTicksOnHover === true) updateTicks(1.112)
		
		plotOver = true;
		
	}
	
	function plotOnMouseOut() {
		
		var relatedClass = d3.select(d3.event.target).attr('class');
		var plotClasses = ['vz-ring-scatter','vz-ring-bar','vz-ring-area','vz-ring-background'];
		
		if (plotClasses.indexOf(relatedClass) > -1) return;
		
		plotOver = false;
		
		plot.selectAll('.vz-ring-indicator').remove();
		defs.selectAll('.vz-tip-path').remove();
		plot.selectAll('.vz-label-tip').remove();
		plot.selectAll('.vz-ring-indicator').remove();
		
		xAxisPlot.selectAll('.vz-ring-x-tick')
		 .transition('plotMove')
		 .duration(scope.duration)
		 .style('opacity',1)
		
		updateXAxis(xLabelRadius);
		plot.selectAll('.vz-ring-series-value').remove();
		
		if (scope.expandTicksOnHover === true) updateTicks(1)
	}
	
	function showSeriesValues(angle) {
		
		plot.selectAll('.vz-ring-series-value').remove();
		
		var degree = 1 * Math.PI/180;
		
		barPlots.forEach(function (plots, seriesIndex) {
			//Find closest date for each series
			var datum = null;
			
			for (var i = 0; i < plots.length; i++) {
				var d = plots[i];
				if ((d.angle > (angle - degree)) && (d.angle < (angle + degree)))  {
					datum = d;
					break;
				}
			}
			
			if (datum) {
				plots.filter(function (d, i) { return d.angle == datum.angle; }).forEach(function (d) {
					appendSeriesValue(3, angle, d.outerRadius)
				});
			}
			
		});
		
		lineAreaPlots.forEach(function (plots, seriesIndex) {
			//Find closest date for each series
			var datum = null;
			
			for (var i = 0; i < plots.length; i++) {
				var d = plots[i];
				if ((d.angle > (angle - degree)) && (d.angle < (angle + degree)))  {
					datum = d;
					break;
				}
			}
			if (datum) {
				appendSeriesValue(3, angle, datum.outerRadius)
			}
		})
		
		scatterPlots.forEach(function (plots, seriesIndex) {
			var datum;
			
			for (var i = 0; i < plots.length; i++) {
				var d = plots[i];
				
				if ((d.angle > (angle - degree)) && (d.angle < (angle + degree))) {
					datum = d;
					break;
				}
			}
			
			if (datum) {
				appendSeriesValue(3, datum.angle, datum.radius)
			}
			
		})
		
	}
	
	function appendSeriesValue(r, angle, radius) {
		plot.append('circle')
		 .attr('class','vz-ring-series-value')
		 .attr('r',r)
		 .attr('cx', Math.cos(angle - (90 * Math.PI/180)) * radius)
		 .attr('cy', Math.sin(angle - (90 * Math.PI/180)) * radius)
		 .style('fill', function (d,i) { return viz.getStyle('value-circle-fill',arguments) })
		 .style('stroke', function (d,i) { return viz.getStyle('value-circle-stroke',arguments) })
		 .style('pointer-events', 'none')
	}
	
	function showXLabel(value) {
		
		var fs = viz.getStyle('x-label-tip-font-size');
		
		var arc = plot.append('path')
		 .attr("class", "vz-label-tip")
		 .style('fill',viz.getStyle('x-label-tip-fill'))
		 .style('fill-opacity',viz.getStyle('x-label-tip-fill-opacity'))
		 .style('pointer-events','none')
		
		var label = plot.append("text")
		 .attr("class", "vz-label-tip")
		 .style('font-size', viz.getStyle('x-label-tip-font-size') + 'px')
		 .style('fill', viz.getStyle('x-label-tip-color'))
		 .style('text-transform','uppercase')
		 .style('pointer-events','none')
		
		createTextOnArc(label,scope.xTickFormatHover(value), scope.id + "_xLabel", 'vz-label-tip', (outerRadius + fs/1.5 + padding/2) , xScale(value));
		
		var tl = label.nodes()[0].getComputedTextLength() + fs * 2;
		var angle = Math.asin((tl/2)/(outerRadius))
		
		labelArc
		 .innerRadius(outerRadius + padding/2)
		 .outerRadius(outerRadius + padding/2 + fs * 2)
		 .cornerRadius(3)
		 .startAngle(xScale(value) - (angle))
		 .endAngle(xScale(value) + (angle))
		
		arc.attr('d',labelArc())
		
	}
	
	/**
	 *  Triggers the render pipeline process to refresh the component on the screen.
	 *  @method vizuly2.viz.RingChart.update
	 */
	viz.update = function () {
		update();
		return viz;
	};
	
	
	function createTextPath(id, className, radius, angle) {
		var path = defs.select('#' + id);
		if (path.nodes().length === 0) {
			path = defs.append("path")
			 .attr('class',className)
			 .attr("id", id);
		}
		path.attr("d", function () {
			return vizuly2.svg.text.textArcPath(radius, angle);
		});
	}
	
	function createTextOnArc(text, value, id, className, radius, angle) {
		
		createTextPath(id + '_textPath', className, radius, angle);
		
		text
		 .style('text-anchor', 'middle')
		
		var textPath = text.select('textPath');
		
		if (textPath.nodes().length === 0) {
			textPath = text.append('textPath');
		}
		textPath.attr("startOffset", "50%")
		 .style("overflow", "visible")
		 .attr("xlink:href", '#' + id + "_textPath")
		 .text(value);
	}
	
	var mouseOverDatum = null;
	
	function lineAreaMouseMove(d, i) {
		var angle = getRadialAngle(d3.event).angle;
		var index = Math.round(d.seriesScale(angle));
		if (mouseOverDatum != null && mouseOverDatum != d[index]) {
			scope.dispatch.apply('mouseout', viz, [this, mouseOverDatum, d.indexOf(mouseOverDatum)]);
			mouseOverDatum = d[index];
			scope.dispatch.apply('mouseover', viz, [this, d[index], index]);
		}
	}
	
	function lineAreaMouseOver(d, i) {
		var angle = getRadialAngle(d3.event).angle;
		var index = Math.round(d.seriesScale(angle));
		mouseOverDatum = d[index];
		if (mouseOverDatum === d[index]) return;
		scope.dispatch.apply('mouseover', viz, [this, d[index], index])
	}
	
	function lineAreaMouseOut(d, i) {
		var angle = getRadialAngle(d3.event).angle;
		var index = Math.round(d.seriesScale(angle));
		scope.dispatch.apply('mouseout', viz, [this, mouseOverDatum, index])
		mouseOverDatum = null;
	}
	
	function lineAreaClick(d, i) {
		var angle = getRadialAngle(d3.event).angle;
		var index = Math.round(d.seriesScale(angle));
		scope.dispatch.apply('click', viz, [this, mouseOverDatum, index])
	}
	
	/*****  STYLES *****/
	
	var stylesCallbacks = [
		{on: "updated.styles", callback: applyStyles},
		{on: "mouseover.styles", callback: styles_onMouseOver},
		{on: "mouseout.styles", callback: styles_onMouseOut}
	];
	
	
	viz.applyCallbacks(stylesCallbacks);
	
	function getSeriesStyle(series, style, args) {
		if (series.styles && series.styles[style] != null) {
			return typeof series.styles[style] === 'function' ? series.styles[style].apply(viz, args) : series.styles[style];
		}
		else {
			return viz.getStyle(style, args);
		}
	}
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		// Grab the d3 selection from the viz so we can operate on it.
		var selection = scope.selection;
		
		var styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-color-bottom'), viz.getStyle('background-color-top'));
		
		// Update the background
		selection.selectAll('.vz-background').style('fill', function () {
			 return 'url(#' + styles_backgroundGradient.attr('id') + ')';
		 })
		 .style('opacity',viz.getStyle('background-opacity'));
		
		// Hide the plot background
		//selection.selectAll('.vz-plot-background').style('opacity', 0);
		
		selection.selectAll('.vz-ring-gutter')
		 .style('fill', function (d, i) {
			 return viz.getStyle('gutter-fill', arguments);
		 })
		 .style('fill-opacity', function (d, i) {
			 return viz.getStyle('gutter-fill-opacity', arguments)
		 });
		
		selection.selectAll('.vz-ring-background')
		 .style('fill', function (d, i) {
			 return viz.getStyle('ring-background-fill', arguments);
		 })
		 .style('fill-opacity', function (d, i) {
			 return viz.getStyle('ring-background-fill-opacity', arguments)
		 });
		
		// Update any of the area paths based on the skin settings
		selection.selectAll('.vz-ring-area')
		 .style('fill', function (d, i) {
			 return getSeriesStyle(d.series, 'series-area-fill', arguments);
		 })
		 .style('fill-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-area-fill-opacity', arguments)
		 });
		
		// Update any of the line paths based on the skin settings
		selection.selectAll('.vz-ring-line')
		 .style('stroke-width', function () {
			 return radiusScale.range()[1] / 450
		 })
		 .style('stroke', function (d, i) {
			 return viz.getStyle('series-line-stroke', arguments)
		 })
		 .style('stroke-opacity', function (d, i) {
			 return viz.getStyle('series-line-opacity', arguments)
		 });
		
		selection.selectAll('.vz-ring-bar')
		 .style('fill', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-fill', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('fill-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-fill-opacity', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-stroke', [d.data, i, d.index, d.seriesIndex]);
		 })
		
		selection.selectAll('.vz-ring-scatter')
		 .style('fill', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-fill', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('fill-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-fill-opacity', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-stroke', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-stroke-opacity', [d.data, i, d.index, d.seriesIndex]);
		 })
		
		
		// Update the x axis ticks
		selection.selectAll('.x-axis-label')
		 .style('font-weight', function (d, i) {
			 return viz.getStyle('axis-font-weight', arguments)
		 })
		 .style('fill', function (d, i) {
			 return viz.getStyle('axis-label-color', arguments)
		 })
		 .style('font-size', function () {
			 return viz.getStyle('axis-font-size', arguments) + 'px'
		 });
		
		// Update the y-axis ticks
		selection.selectAll('.vz-y-axis-tick')
		 .style('stroke', function (d, i) {
			 return viz.getStyle('axis-stroke', arguments)
		 })
		 .style('stroke-width', 1)
		 .style('opacity', function (d, i) {
			 return viz.getStyle('axis-stroke-opacity', arguments)
		 })
		
		// Update the y-axis tick labels
		yAxisPlot.selectAll('.vz-ring-series-label')
		 .style('font-size', function () {
			 return viz.getStyle('series-label-font-size', arguments) + 'px'
		 })
		 .style('fill', function (d, i) {
			 return viz.getStyle('series-label-color', arguments)
		 })
		 .style('font-weight', function (d, i) {
			 return viz.getStyle('series-label-font-weight', arguments)
		 })
		 .style('text-transform', function (d, i) {
			 return viz.getStyle('series-label-text-transform', arguments)
		 })
		
		plot.selectAll('.vz-ring-series-arc')
		 .style('fill', function (d, i) {
			 return getSeriesStyle(d.series, 'series-arc-fill', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('fill-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-arc-fill-opacity', [d.data, i, d.index, d.seriesIndex]);
		 })
		
		xAxisPlot.selectAll('.vz-ring-x-tick-label')
		 .style('font-size', function (d,i) { return viz.getStyle('axis-font-size', arguments) + 'px'})
		
		xAxisPlot.selectAll('.x-axis-major-tick, .x-axis-minor-tick')
		 .style('stroke', viz.getStyle('tick-stroke',[]))
		 .style('stroke-opacity', viz.getStyle('tick-stroke-opacity',[]));
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function styles_onMouseOver(e, datum, index, j) {
		
		viz.removeDataTip();
		viz.showDataTip(e,datum,index,j);
		
		// Animate reduced opacity on area path
		plot.selectAll('.vz-ring-area').filter(function (d, i) { return d.series === datum.series })
		 .style('fill', function (d, i) {
			 return getSeriesStyle(d.series, 'series-area-fill-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('fill-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-area-fill-opacity-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		
		plot.selectAll('.vz-ring-line').filter(function (d, i) { return d.series === datum.series })
		 .style('stroke', function (d, i) {
			 return getSeriesStyle(d.series, 'series-line-stroke-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-line-opacity-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		
		plot.selectAll('.vz-ring-bar').filter(function (d, i) { return d.series === datum.series && i === index})
		 .style('fill', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-fill-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('fill-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-fill-opacity-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-stroke-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-stroke-opacity-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		
		plot.selectAll('.vz-ring-scatter').filter(function (d, i) { return d.series === datum.series && i === index})
		 .style('fill', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-fill-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('fill-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-fill-opacity-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-stroke-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke-opacity', function (d, i) {
			 //		 return getSeriesStyle(d.series, 'series-scatter-stroke-opacity-over', [d.data, i, d.index, d.seriesIndex]);
		 })
		
		scope.selection.selectAll('.vz-point-tip').remove();
		
	}
	
	
	function styles_onMouseOut(e, datum, index) {
		
		viz.removeDataTip();
		
		if (datum === null) return;
		
		// Animate area opacity back to original
		plot.selectAll('.vz-ring-area').filter(function (d, i) { return d.series === datum.series })
		 .style('fill', function (d, i) {
			 return getSeriesStyle(d.series, 'series-area-fill', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('fill-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-area-fill-opacity', [d.data, i, d.index, d.seriesIndex]);
		 });
		
		plot.selectAll('.vz-ring-line').filter(function (d, i) { return d.series === datum.series })
		 .style('stroke', function (d, i) {
			 return getSeriesStyle(d.series, 'series-line-stroke', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-line-opacity', [d.data, i, d.index, d.seriesIndex]);
		 })
		
		
		plot.selectAll('.vz-ring-bar').filter(function (d, i) { return d.series === datum.series && i === index})
		 .style('fill', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-fill', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('fill-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-fill-opacity', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-stroke', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-bar-stroke-opacity', [d.data, i, d.index, d.seriesIndex]);
		 })
		
		
		plot.selectAll('.vz-ring-scatter').filter(function (d, i) { return d.series === datum.series })
		 .style('fill', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-fill', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('fill-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-fill-opacity', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-stroke', [d.data, i, d.index, d.seriesIndex]);
		 })
		 .style('stroke-opacity', function (d, i) {
			 return getSeriesStyle(d.series, 'series-scatter-stroke-opacity', [d.data, i, d.index, d.seriesIndex]);
		 })
		
	}
	
	
	function dataTipRenderer(tip, e, d, i, j, x, y) {
		
		if (!d.series.dataTipLabels) return false;
		
		var bounds = e.getBoundingClientRect();
		var x1 = d3.event.pageX; //- bounds.left;
		var y1 = d3.event.pageY; //- bounds.top;
		
		var tipLabels = d.series.dataTipLabels(d, d.data, i)
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header1"> HEADER3 </div>';
		
		html = html.replace("HEADER1", tipLabels[0]);
		html = html.replace("HEADER2", tipLabels[1]);
		html = html.replace("HEADER3", tipLabels[2]);
		
		tip.html(html);
		
		return [x1 - 100, y1 - 150 - (d.series.plotType == viz.PLOT_BAR_STACKED ? 40 : 0)];
		
	}
	
	return viz;
	
};