/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 This source code is covered under the following license: http://vizuly.io/commercial-license/
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.220

/**
 * @class
 */
vizuly2.viz.Corona = function (parent) {
	
	var d3 = vizuly2.d3;
	
	/** @lends vizuly2.viz.Corona.properties */
	var properties = {
		/**
		 * Array of Arrays. Each array represents a series of data.  Assumes each series has the same length and same collection of xScale ordinal values.
		 * @member {Array}
		 * @default Needs to be set at runtime
		 *
		 * @example
		 * [
		 *   [
		 *     {"hour": "0", "page": "/download/radial-progress-source-code", "views": 9, "key": "/download/radial-progress-source-code"},
		 *     {"hour": "1", "page": "/download/radial-progress-source-code", "views": 19, "key": "/download/radial-progress-source-code"},
		 *     ...
		 *   ],
		 *   [
		 *     {"hour": "0", "page": "/political_influence", "views": 9, "key": "/political_influence" },
		 *     { "hour": "1", "page": "/political_influence", "views": 6, "key": "/political_influence" },
		 *     ...
		 *    ]
		 *  ...
		 * ]
		 */
		'data': null,
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
			'top': '10%',
			'bottom': '10%',
			'left': '10%',
			'right': '10%'
		},
		/**
		 * Duration (in milliseconds) of any component transitions.
		 * @member {Number}
		 * @default  500
		 */
		'duration': 500,
		/**
		 * Determines layout of Corona Chart.  Can use either 'OVERLAP' or 'STACKED'
		 * @member {String}
		 * @default 'OVERLAP'
		 *
		 */
		'layout': vizuly2.viz.layout.OVERLAP,
		/**
		 * Determines the inner radius of the Corona Chart in either pixels (Number) or percentage of parent container (XX%)
		 * @member {Number/String}
		 * @default '100'
		 *
		 */
		'innerRadius': 100,
		/**
		 * Determines the outer radius of the Corona Chart in either pixels (Number) or percentage of parent container (XX%)
		 * @member {Number/String}
		 * @default '290'
		 *
		 */
		'outerRadius': 290,
		/**
		 * Scale type used to measure the distance from the center of the Corona for each line/area datum.
		 * @member {d3.scale}
		 * @default  d3.scaleLinear
		 */
		'radiusScale': d3.scaleLinear(),
		/**
		 * Function that returns the datum property used to calculate the radial angle the line/area plot datum.
		 * @member {Function}
		 * @default  Must be set at runtime
		 * @example
		 * viz.x(function(d,i) { return Number(d.myProperty) });
		 */
		'x': null,
		/**
		 * Function that returns the datum property used to calculate the distance from the corona center for the line/area plot datum.
		 * @member {Function}
		 * @default  Must be set at runtime
		 * @example
		 * viz.y(function(d,i) { return Number(d.myProperty) });
		 */
		'y': null,
		/**
		 * D3 Axis used to create individual ticks displayed as circular rings and labels in the Corona background.
		 * @member {d3.axis}
		 * @default d3.axisLeft
		 */
		'yAxis': d3.axisLeft(),
		/**
		 * Label formatter for the y axis.  Can be customized to modify labels along axis.
		 * @member {function}
		 * @default function (d) { return d }
		 * @example
		 * //Sets each axis tick label to a currency format
		 * viz.yTickFormat(function (d, i) { return '$' + d3.format('.2f')(d) })
		 */
		'yTickFormat': function (d) { return d },
		/**
		 * Number of y axis ticks (circular rings/labels) to display
		 * @member {Number}
		 * @default 10
		 */
		'yTickCount': 10,
		/**
		 * D3 Axis used to create axis labels radially around the perimeter of the chart.
		 * @member {d3.axis}
		 * @default d3.axisBottom
		 */
		'xAxis': d3.axisBottom(),
		/**
		 * Label formatter for the x axis.  Can be customized to modify labels along axis.
		 * @member {function}
		 * @default function (d) { return d }
		 * @example
		 * //Sets each axis tick label to a currency format
		 * viz.xTickFormat(function (d, i) { return '$' + d3.format('.2f')(d) })
		 */
		'xTickFormat': function (d) { return d },
		/**
		 * Number of x axis ticks (circular rings/labels) to display
		 * @member {Number}
		 * @default 10
		 */
		'xTickCount': 10,
		/**
		 * Scale type used to measure and position datums along radial angles around the center.  The chart will try and auto-determine the scale type based on
		 * the value type being returned by the viz.y accessor.  String values will use a d3.scaleBand, date values will use a d3.scaleTime,
		 * and numeric values will use a d3.scaleLinear.
		 * @member {d3.scale}
		 * @default  undefined - set at runtime automatically
		 */
		'xScale': 'undefined',
		/**
		 * Curve shape for Line and Area Plots.   You can use any {@link 'https://github.com/d3/d3-shape#curves'|d3.Curve} type
		 * @member {Object}
		 * @default d3.curveLinear
		 * @example
		 * //Sets a step curve type
		 * viz.curve(d3.curveStep)
		 */
		'curve': d3.curveCardinalClosed,
		/**
		 *  The dataTipRenderer is used to customize the data tip that is shown on mouse-over events.
		 *  You can append to or modify the 'tip' parameter to customize the data tip.
		 *  You can also return modified x, y coordinates to place the data tip in a different location.
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
		 *function dataTipRenderer(tip, e, d, i, j, x, y) {
		 *		var bounds = e.getBoundingClientRect();
		 *		var x1 = d3.event.pageX; // - bounds.left;
		 *		var y1 = d3.event.pageY; // -bounds.top;
		 *		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 *		 '<div class="vz-tip-header-rule"></div>' +
		 *		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 *		 '<div class="vz-tip-header-rule"></div>' +
		 *		 '<div class="vz-tip-header1"> HEADER3 </div>';
		 *
		 *		var h1, h2, h3;
		 *
		 *		if (d3.select(e).attr('class') == 'vz-corona-area') {
		 *			h1 = ' ';
		 *			h3 = ' ';
		 *			h2 = scope.seriesLabel(scope.data[i][0]);
		 *		}
		 *		else {
		 *			h1 = scope.xTickFormat(scope.x(d));
		 *			h2 = scope.seriesLabel(d);
		 *			h3 = scope.yTickFormat(scope.y(d));
		 *		}
		 *
		 *		html = html.replace("HEADER1", h1);
		 *		html = html.replace("HEADER2", h2);
		 *		html = html.replace("HEADER3", h3);
		 *
		 *		tip.html(html);
		 *
		 *		if (d3.select(e).attr('class') == 'vz-corona-area') {
		 *			tip.selectAll('.vz-tip-header2')
		 *			 .style('color', function () {
		 *				 return viz.getStyle('area-fill', [scope.data[i], i])
		 *			 })
		 *		}
		 *
		 *		return [x1 - 100, y1 - 150];
		 *}
		 */
		'dataTipRenderer': dataTipRenderer,
		/**
		 * Function that returns the series label of the datum
		 * @member {Function}
		 * @default  function (d) { return d.series }
		 * @example
		 * viz.seriesLabel(function(d,i) { return d.myProperty });
		 */
		'seriesLabel': function (d) { return d.series }
	};
	
	var styles = {
		'background-opacity': 1,
		'background-color-top': "#FFF",
		'background-color-bottom': "#DDD",
		'label-color': "#000",
		'line-stroke': function (d, i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return colors[i % colors.length];
		},
		'line-stroke-over': function (d, i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return d3.rgb(colors[i % colors.length]).brighter();
		},
		'line-opacity': .8,
		'line-opacity-over': .9,
		'area-fill': function (d, i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return "url(#" + vizuly2.svg.gradient.radialFade(viz, colors[i % colors.length], [1, .35]).attr("id") + ")";
		},
		'area-fill-opacity': 1,
		'area-fill-opacity-over': 1,
		'axis-font-size': function () {
			return Math.max(10, Math.round(outerRadius / 25));
		},
		'axis-font-weight': 'normal',
		'axis-stroke': "#777",
		'axis-opacity': .25,
		'center-label-font-size': function () {
			return scope.radiusScale.range()[1] / 20
		}
	};
	
	/** @lends vizuly2.viz.Corona.events */
	var events = [
		/**
		 * Fires when user moves the mouse over a series group.
		 * @event vizuly2.viz.Corona.mouseover
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param j -  The series index of the datum
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseover', function (e, d, i) { ... });
		 */
		'mouseover',
		/**
		 * Fires when user moves the mouse off a radar series group.
		 * @event vizuly2.viz.Corona.mouseout
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param j -  The series index of the datum
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseout', function (e, d, i) { ... });
		 */
		'mouseout',
		/**
		 * Fires when user clicks on a given series.
		 * @event vizuly2.viz.Corona.click
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param j -  The series index of the datum
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('click', function (e, d, i) { ... });
		 */
		'click',
		/**
		 * Fires when user moves mouse over a datum vertex.
		 * @event vizuly2.viz.Corona.vertex_mouseover
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param j -  The series index of the datum
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('vertex_mouseover', function (e, d, i) { ... });
		 */
		'vertex_mouseover',
		/**
		 * Fires when user moves mouse off a datum vertex.
		 * @event vizuly2.viz.Corona.vertex_mouseout
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param j -  The series index of the datum
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('vertex_mouseout', function (e, d, i) { ... });
		 */
		'vertex_mouseout'
	]
	
	
	// This is the object that provides pseudo "protected" properties that the vizuly.viz function helps create
	var scope = {};
	scope.initialize = initialize;
	scope.properties = properties;
	scope.styles = styles;
	scope.events = events;
	
	// Create our Vizuly component
	var viz = vizuly2.core.component(parent, scope);
	viz.version = '2.1.220';
	
	var size;                           // Holds the 'size' variable as defined in viz.util.size()
	var tipRadius;                      // radius of each hit circle
	var xAxisTickStep;                  // The number of data points between each xAxis tick
	var xAxisTickData;                  // Holds the ticks generated by the d3.axis
	var stack;                          // used for the stacking layout for the lines and area
	var stackSeries;                    // Holds transformed stack data.
	var innerRadius;
	var outerRadius;
	
	var line = d3.radialLine();    // d3 line path generator for our RADIAL lines
	var area = d3.radialArea();    // d3 area path generator for our RADIAL areas
	
	//These are all d3.selection objects we use to insert and update svg elements into
	var svg, g, xAxisPlot, yAxisPlot, plot, background, plotBackground, centerLabel, series, defs, pointHitArea;
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the individual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as D3 selections.
	function initialize() {
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.util.getDefs(viz);
		g = svg.append("g").attr("class", "vz-corona-viz");
		xAxisPlot = g.append("g").attr("class", "vz-xAxis-plot");
		yAxisPlot = g.append("g").attr("class", "vz-yAxis-plot");
		plot = g.append("g").attr("class", "vz-plot").attr("clip-path", "url(#" + scope.id + "_plotClipPath)");
		plotBackground = plot.append("rect").attr("class", "vz-plot-background");
		series = plot.append("g").attr("class", "vz-series");
		pointHitArea = g.append("g").attr("class", "vz-point-areas");
		centerLabel = g.append("text").attr("class", "vz-corona-center-label");
		
		// Make sure we have a default tick format - as we need to use these for our layout
		scope.yAxis.tickFormat(function (d) {
			return d
		});
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
		
		// Get our size based on height, width, and margin
		size = vizuly2.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		// Prep data in format for stack
		// This assumes all series share the same key value for the x-axis and are ordered accordingly.
		stackSeries = [];
		var stackKeys = [];
		
		scope.data.forEach(function (series, i) {
			stackKeys.push("series" + i);
		})
		
		for (var columnIndex = 0; columnIndex < scope.data[0].length; columnIndex++) {
			var row = {};
			row.x = scope.x(scope.data[0][columnIndex])
			scope.data.forEach(function (series, i) {
				row['series' + i] = scope.y(series[columnIndex]);
			})
			stackSeries.push(row);
		}
		
		// The offset is used for the stack layout
		var offset = (scope.layout == vizuly2.viz.layout.STACKED) ? d3.stackOffsetNone : vizuly2.util.stackOffsetBaseline;
		var order = (scope.layout == vizuly2.viz.layout.STACKED) ? d3.stackOrderReverse : d3.stackOrderReverse;
		
		// The d3.stack handles all of the d.x and d.y measurements for various stack layouts - we will let it do its magic here
		stack = d3.stack()
		 .keys(stackKeys)
		 .order(order)
		 .offset(offset);
		// Apply the stack to our data - note this is a destructive operation and assumes certain properties can be mutated (x, x0, y, y0)
		stackSeries = stack(stackSeries);
		
		// Set our theta scale and range (or range bands) depending on scale type.
		if (scope.xScale == "undefined") {
			var scale;
			if (typeof viz.x()(scope.data[0][0]) == "string") {
				scale = d3.scaleBand();
				scale.range([0, 2 * Math.PI]);
			}
			else if (viz.x()(scope.data[0][0]) instanceof Date) {
				scale = d3.scaleTime();
				scale.range([0, 2 * Math.PI]);
			}
			else {
				//scale = d3.scale.ordinal();
				scale = d3.scaleLinear();
				scale.range([0, 2 * Math.PI]);
			}
			scope.xScale = scale;
		}
		
		// Set theta scale domain - see if it is ordinal and map values, otherwise assume min/max is good enough.
		if (typeof viz.x()(scope.data[0][0]) == "string") {
			scope.xScale.domain(scope.data[0].map(function (d) {
				return scope.x(d);
			}));
		}
		else {
			scope.xScale.domain([d3.min(scope.data[0], function (d) {
				return scope.x(d);
			}), d3.max(scope.data[0], function (d) {
				return scope.x(d);
			})]);
		}
		
		if (size.measuredWidth < size.measuredHeight) {
			innerRadius = vizuly2.util.getRelativeWidth(scope.innerRadius, scope.selection.node());
			outerRadius = vizuly2.util.getRelativeWidth(scope.outerRadius, scope.selection.node());
		}
		else {
			innerRadius = vizuly2.util.getRelativeHeight(scope.innerRadius, scope.selection.node());
			outerRadius = vizuly2.util.getRelativeHeight(scope.outerRadius, scope.selection.node());
		}
		
		
		// Set our radius scale range
		scope.radiusScale.range([innerRadius, outerRadius]);
		
		// Set our radius scale domain based on the data values
		scope.radiusScale.domain([d3.min(stackSeries, stackMin), d3.max(stackSeries, stackMax)]);
		
		// Set our area path generator properties
		area.curve(scope.curve)
		 .angle(function (d) {
			 return scope.xScale(d.data.x);
		 })
		 .innerRadius(function (d, i) {
			 return scope.radiusScale(d[0]);
		 })
		 .outerRadius(function (d, i) {
			 return scope.radiusScale(d[1]);
		 });
		
		// Set our line path generator properties
		line.curve(scope.curve)
		 .angle(function (d) {
			 return scope.xScale(d.data.x);
		 })
		 .radius(function (d, i) {
			 return scope.radiusScale(d[1]);
		 });
		
		scope.yAxis
		 .scale(scope.radiusScale)
		 .tickSize(outerRadius)
		 .ticks(scope.yTickCount)
		 .tickFormat(scope.yTickFormat);
		
		scope.xAxis
		 .scale(scope.xScale)
		 .ticks(scope.xTickCount)
		 .tickFormat(scope.xTickFormat);
		
		// Calculate our tick step based on number of ticks we have and length of data.
		xAxisTickStep = Math.round(stackSeries[0].length / scope.xTickCount);
		
		// Use the d3 axis to create out own dummy tick data so we can use it later.
		xAxisTickData = function () {
			var a = [];
			for (var i = 0; i < scope.xTickCount; i++) {
				a.push(i)
			}
			return a
		}.apply(this);
		
		// Measure the tipRadius (used to detect interaction events)
		tipRadius = Math.min(size.width / 50, size.height / 50);
		
		// Tell everyone we are done measuring.
		scope.dispatch.apply('measured', viz);
		
	}
	
	function stackMax(layer) {
		return d3.max(layer, function (d) {
			return d[1];
		});
	}
	
	function stackMin(layer) {
		return d3.min(layer, function (d) {
			return d[0];
		});
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
		plot.style("width", size.width).style("height", size.height).attr("transform", "translate(" + (size.left + size.width / 2) + "," + (size.top + size.height / 2) + ")");
		pointHitArea.style("width", size.width).style("height", size.height).attr("transform", "translate(" + size.left + "," + size.top + ")");
		xAxisPlot.attr("transform", "translate(" + (size.left + size.width / 2) + "," + (size.height / 2 + size.top + 3) + ")");
		yAxisPlot.attr("transform", "translate(" + (size.left + size.width / 2) + "," + (size.height / 2 + size.top + 3) + ")");
		plotBackground.attr("width", size.width).attr("height", size.height);
		
		var seriesArea = series.selectAll(".vz-corona-area").data(stackSeries);
		seriesArea.exit().remove();
		seriesArea = seriesArea.enter()
		 .append("path")
		 .attr("class", "vz-corona-area")
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
		 .merge(seriesArea)
		
		seriesArea
		 .transition()
		 .duration(scope.duration)
		 .attr("d", area)
		
		
		var seriesLine = series.selectAll(".vz-corona-line").data(stackSeries);
		seriesLine.exit().remove();
		seriesLine = seriesLine.enter()
		 .append("path")
		 .attr("class", "vz-corona-line")
		 .style("fill", "none")
		 .merge(seriesLine)
		
		seriesLine
		 .transition()
		 .duration(scope.duration)
		 .attr("d", line)
		
		// Remove any point hit areas - we make new ones each time.
		pointHitArea.selectAll(".vz-tip").remove();
		
		// For EVERY data point across all series we are going to create a svg.g group and put a circle in it
		// The circle in it will have a very small (.001) opacity and be used to capture mouse events for
		// each data point
		// If you need to optimize this chart for performance you should consider removing these elements, it will
		// greatly speed up the rendering time and responsiveness of the chart
		stackSeries.forEach(function (series, j) {
			var points = pointHitArea.selectAll("vz-tip").data(series).enter()
			 .append("g").attr("class", "vz-tip series_" + j)
			 .attr("transform", function (d, i) {
				 var point = cartesianToPolar(d[1], d.data.x);
				 return "translate(" + point.x + "," + point.y + ")"
			 })
			 .on("mouseover", function (d, i) {
				 scope.dispatch.apply('vertex_mouseover', viz, [this, scope.data[j][i], i, j]);
			 })
			 .on("touchstart", function (d, i) {
				 scope.dispatch.apply('vertex_mouseover', viz, [this, scope.data[j][i], i, j]);
			 })
			 .on("mouseout", function (d, i) {
				 scope.dispatch.apply('vertex_mouseout', viz, [this, scope.data[j][i], i, j]);
			 })
			 .on("click", function (d, i) {
				 scope.dispatch.apply('click', viz, [this, scope.data[j][i], i, j]);
			 });
			
			points.each(function () {
				var tip = d3.select(this);
				tip.append("circle")
				 .attr("class", "vz-hit-circle")
				 .style("fill", "#FFF")
				 .style("stroke", null)
				 .style("opacity", .001)
				 .transition()
				 .attr("r", tipRadius);
			});
			
		});
		
		
		// We use these arc paths so labels can be created along each radial curve for the x axis
		defs.selectAll(".vz-x-axis-arc-path").remove();
		defs.selectAll(".vz-x-axis-arc-path")
		 .data(xAxisTickData)
		 .enter()
		 .append("path")
		 .attr("class", "vz-x-axis-arc-path")
		 .attr("id", function (d, i) {
			 return scope.id + "_x_text_arc_" + i;
		 })
		 .attr("d", function (d, i) {
			 var ret = vizuly2.svg.text.textArcPath(outerRadius * 1.05, scope.xScale(scope.x(scope.data[0][i * xAxisTickStep])));
			 return ret;
		 });
		
		
		// Create xAxis Labels using the def arc paths we created above
		xAxisPlot.selectAll(".vz-corona-x-axis-tick").remove();
		xAxisPlot.selectAll(".vz-corona-x-axis-tick")
		 .data(xAxisTickData)
		 .enter().append("g")
		 .attr("class", "vz-corona-x-axis-tick")
		 .append("text")
		 .append("textPath")
		 .attr("text-anchor", "middle")
		 .attr("startOffset", "50%")
		 .style("overflow", "visible")
		 .attr("xlink:href", function (d, i) {
			 return "#" + scope.id + "_x_text_arc_" + i;
		 })
		 .text(function (d, i) {
			 return scope.xAxis.tickFormat()(scope.x(scope.data[0][i * xAxisTickStep]));
		 })
		
		
		// Create yAxis label placeholders - a little hack to have D3 figure out the best axis lines.
		yAxisPlot.selectAll(".vz-label-ticks").remove();
		yAxisPlot.append("g")
		 .attr("class", "vz-label-ticks")
		 .style("display", "none")
		 .call(scope.yAxis)
		
		// Now lets get our ticks to create our circles
		yAxisPlot.selectAll(".vz-y-axis-tick").remove();
		var ticks = yAxisPlot.selectAll(".tick").nodes().map(function (d) {
			return d3.select(d).datum()
		});
		
		yAxisPlot.selectAll(".vz-y-axis-tick")
		 .data(ticks).enter()
		 .append("circle").attr("class", "vz-y-axis-tick")
		 .attr("cx", 0)
		 .attr("cy", 0)
		 .attr("r", function (d) {
			 return scope.radiusScale(d)
		 })
		 .style("fill", "none");
		
		// Create our yAxis labels
		defs.selectAll(".vz-y-axis-arc-path").remove();
		yAxisPlot.selectAll(".vz-y-axis-tick-label").remove();
		ticks.forEach(function (tick, j) {
			// We use these arc paths so labels can be created along each radial curve for the x axis
			defs.append("path")
			 .attr("class", "vz-y-axis-arc-path")
			 .attr("id", function (d, i) {
				 return scope.id + "_y_text_arc_" + j + "_" + i;
			 })
			 .attr("d", function () {
				 return vizuly2.svg.text.textArcPath(scope.radiusScale(tick) * 1.02, 0)
			 });
			// Attach our yAxis labels and refernece the path def above.
			yAxisPlot.append("text")
			 .attr("class", "vz-y-axis-tick-label")
			 .append("textPath")
			 .attr("text-anchor", "middle")
			 .attr("startOffset", "50%")
			 .style("overflow", "visible")
			 .attr("xlink:href", function (d, i) {
				 return "#" + scope.id + "_y_text_arc_" + j + "_" + i;
			 })
			 .text(function () {
				 return scope.yAxis.tickFormat()(tick);
			 })
		});
		
		centerLabel
		 .attr('x', size.left + size.width / 2)
		 .attr('y', size.top + size.height / 2)
		
		// Let everyone know we are done updating.
		scope.dispatch.apply('updated', viz);
		
	}
	
	// Used to translate from cartesian coordinates to polar coordinates.
	function cartesianToPolar(x, y) {
		var r = scope.radiusScale(x);
		var a = scope.xScale(y) - Math.PI / 2;
		x = r * Math.cos(a) + size.width / 2;
		y = r * Math.sin(a) + size.height / 2;
		return ({x: x, y: y});
		
	}
	
	/**
	 *  Triggers the render pipeline process to refresh the component on the screen.
	 *  @method  vizuly2.viz.Corona.update
	 */
	viz.update = function () {
		update();
		return viz;
	};
	
	
	/*****  STYLES *****/
	
	var stylesCallbacks = [
		{on: "updated.styles", callback: applyStyles},
		{on: "mouseover.styles", callback: styles_onMouseOver},
		{on: "mouseout.styles", callback: styles_onMouseOut},
		{on: "vertex_mouseover.styles", callback: styles_vertexOnMouseOver},
		{on: "vertex_mouseout.styles", callback: styles_vertexOnMouseOut}
	];
	
	
	viz.applyCallbacks(stylesCallbacks);
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		// Grab the d3 selection from the viz so we can operate on it.
		var selection = scope.selection;
		
		var styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-color-bottom'), viz.getStyle('background-color-top'));
		
		// Update the background
		selection.selectAll(".vz-background").style("fill", function () {
			 return "url(#" + styles_backgroundGradient.attr("id") + ")";
		 })
		 .style('opacity',viz.getStyle('background-opacity'));
		
		// Hide the plot background
		selection.selectAll(".vz-plot-background").style("opacity", 0);
		
		// Update any of the area paths based on the skin settings
		selection.selectAll(".vz-corona-area")
		 .style("fill", function (d, i) {
			 return viz.getStyle('area-fill', arguments);
		 })
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('area-fill-opacity', arguments)
		 });
		
		// Update any of the line paths based on the skin settings
		selection.selectAll(".vz-corona-line")
		 .style("stroke-width", function () {
			 return scope.radiusScale.range()[1] / 450
		 })
		 .style("stroke", function (d, i) {
			 return viz.getStyle('line-stroke', arguments)
		 })
		 .style("stroke-opacity", function (d, i) {
			 return viz.getStyle('line-opacity', arguments)
		 });
		
		// Hide all the data points
		selection.selectAll(".vz-data-point").style("opacity", 0);
		
		// Update the x axis ticks
		selection.selectAll(".vz-corona-x-axis-tick")
		 .style("font-weight", function (d, i) {
			 return viz.getStyle('axis-font-weight', arguments)
		 })
		 .style("fill", function (d, i) {
			 return viz.getStyle('label-color', arguments)
		 })
		 .style("fill-opacity", .7)
		 .style("font-size", function () { return viz.getStyle('axis-font-size', arguments) + "px" });
		
		// Update the y-axis ticks
		selection.selectAll(".vz-y-axis-tick")
		 .style("stroke", function (d, i) {
			 return viz.getStyle('axis-stroke', arguments)
		 })
		 .style("stroke-width", 1)
		 .style("opacity", function (d, i) {
			 return viz.getStyle('axis-opacity', arguments)
		 })
		
		// Update the y-axis tick labels
		selection.selectAll(".vz-y-axis-tick-label")
		 .style("font-size", function () {
			 return viz.getStyle('axis-font-size', arguments) + "px"
		 })
		 .style("fill", function (d, i) {
			 return viz.getStyle('label-color', arguments)
		 })
		 .style("font-weight", function (d, i) {
			 return viz.getStyle('axis-font-weight', arguments)
		 })
		 .style("fill-opacity", 0.5);
		
		centerLabel
		 .style('font-size', function () {
			 return viz.getStyle('center-label-font-size', arguments) + 'px'
		 })
		 .style('fill', function () {
			 return viz.getStyle('label-color', arguments)
		 })
		 .style('text-anchor', 'middle')
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function styles_onMouseOver(e, d, i, j) {
		
		// Animate reduced opacity on area path
		plot.selectAll('.vz-corona-area').transition('styles_mouseover')
		 .style("fill-opacity", function (datum, index) {
			 return i === index ? viz.getStyle('area-fill-opacity-over', arguments) : .1;
		 })
		
		plot.selectAll('.vz-corona-line').transition('styles_mouseover')
		 .style("stroke", function (datum, index) {
			 return i === index ? viz.getStyle('line-stroke-over', arguments) : viz.getStyle('line-stroke', arguments);
		 })
		 .style("stroke-opacity", function (datum, index) {
			 return i === index ? viz.getStyle('line-opacity-over', arguments) : .2;
		 })
		
		centerLabel.text(scope.seriesLabel(scope.data[i][0]))
		
		scope.selection.selectAll('.vz-point-tip').remove();
		
	}
	
	
	function styles_onMouseOut(e, d, i) {
		
		// Animate area opacity back to original
		plot.selectAll(".vz-corona-area").transition('styles_mouseover')
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('area-fill-opacity', arguments)
		 });
		
		plot.selectAll('.vz-corona-line').transition('styles_mouseover')
		 .style("stroke-opacity", function (d, i) {
			 return viz.getStyle('line-opacity', arguments)
		 });
		
		pointHitArea.selectAll('.vz-point-tip').remove();
		
		centerLabel.text('')
		
	}
	
	// This runs on every mouse over
	function styles_vertexOnMouseOver(e, d, i, j) {
		
		var datum = stackSeries[j][i];
		
		scope.selection.selectAll('.vz-point-tip').remove();
		
		// Animate the changes to the line path
		plot.selectAll(".vz-corona-line").transition('vertex_mouseover')
		 .style("stroke-width", function () {
			 return scope.radiusScale.range()[1] / 270
		 })
		 .style("stroke", function (d, i) {
			 return viz.getStyle('line-stroke-over', [d,j])
		 })
		 .style("opacity", function (d, i) {
			 return (i == j) ? 1 : .2
		 });
		
		// Animate reduced opacity on area path
		plot.selectAll(".vz-corona-area").transition('vertex_mouseover')
		 .style("opacity", function (d, i) {
			 return (i == j) ? 1 : .15
		 });
		
		// Set the stroked dash highlight
		plot.append("circle")
		 .attr("class", "vz-y-axis-mouseover")
		 .attr("cx", 0)
		 .attr("cy", 0)
		 .attr("r", function () {
			 return scope.radiusScale(datum[1])
		 })
		 .style("stroke", viz.getStyle('axis-stroke', []))
		 .style("fill", "none")
		 .style("stroke-dasharray", function () {
			 return scope.radiusScale.range()[1] / 80 + "," + scope.radiusScale.range()[1] / 40
		 });
		
		// Reduce the contrast on the y axis ticks
		yAxisPlot.selectAll(".vz-y-axis-tick").style("opacity", .1)
		
		// Remove any previous point tips
		plot.selectAll(".vz-point-tip").remove();
		
		// Add a highlight circle
		d3.select(e).append("circle")
		 .attr("class", "vz-point-tip")
		 .attr("r", 4)
		 .style("fill", "#000")
		 .style("stroke", '#FFF')
		 .style("stroke-width", 2)
		 .style("pointer-events", "none");
		
		// Add the arc we need to show the page views
		defs.append("path")
		 .attr("class", "vz-tip-path")
		 .attr("id", function (d, i) {
			 return viz.id() + "_tip_path_arc_mouseover";
		 })
		 .attr("d", function () {
			 console.log('d.hour = ' + d.hour)
			 return vizuly2.svg.text.textArcPath(scope.radiusScale(datum[1]) * 1.05, scope.xScale(scope.x(d)));
		 });
		
		// Show the hour
		plot.append("text")
		 .attr("class", "vz-label-tip")
		 .style("font-size", Math.max(8, Math.round(scope.radiusScale.range()[1] / 17)) + "px")
		 .style("text-transform", "uppercase")
		 .style("font-family", "Open Sans")
		 .style("fill-opacity", .75)
		 .style("fill", function (d, i) {
			 return viz.getStyle('label-color', arguments)
		 })
		 .style('text-anchor', 'middle')
		 .append("textPath")
		 .attr("startOffset", "50%")
		 .style("overflow", "visible")
		 .attr("xlink:href", function (d, i) {
			 return "#" + viz.id() + "_tip_path_arc_mouseover";
		 })
		 .text(function () {
			 return scope.xAxis.tickFormat()(scope.x(d));
		 });
		
		centerLabel.text(scope.seriesLabel(scope.data[j][0]))
		
		viz.showDataTip(e, d, i)
	}
	
	// This runs on every mouse out
	function styles_vertexOnMouseOut(e, d, i, j) {
		
		// Animate the line paths back to original settings
		plot.selectAll(".vz-corona-line").transition('vertex_mouseover')
		 .style("stroke-width", function () {
			 return scope.radiusScale.range()[1] / 450
		 })
		 .style("stroke", function (d, i) {
			 return viz.getStyle('line-stroke', arguments)
		 })
		 .style("opacity", function (d, i) {
			 return viz.getStyle('line-opacity', arguments)
		 })
		
		// Animate area opacity back to original
		plot.selectAll(".vz-corona-area").transition('vertex_mouseover')
		 .style("opacity", 1);
		
		// Remove the data tip
		plot.selectAll(".vz-point-tip").remove();
		plot.selectAll(".vz-label-tip").remove();
		defs.selectAll(".vz-tip-path").remove();
		
		// Remove dashed line highlight
		plot.selectAll(".vz-y-axis-mouseover").remove();
		
		// Put the y-axis ticks back to original opacity
		yAxisPlot.selectAll(".vz-y-axis-tick")
		 .style("opacity", function (d, i) {
			 return viz.getStyle('axis-opacity', arguments)
		 })
		
		centerLabel.text('')
		
		viz.removeDataTip();
	}
	
	function dataTipRenderer(tip, e, d, i, j, x, y) {
		
		var bounds = e.getBoundingClientRect();
		var x1 = d3.event.pageX; // - bounds.left;
		var y1 = d3.event.pageY; // -bounds.top;
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header1"> HEADER3 </div>';
		
		var h1, h2, h3;
		
		if (d3.select(e).attr('class') == 'vz-corona-area') {
			h1 = ' ';
			h3 = ' ';
			h2 = scope.seriesLabel(scope.data[i][0]);
		}
		else {
			h1 = scope.xTickFormat(scope.x(d));
			h2 = scope.seriesLabel(d);
			h3 = scope.yTickFormat(scope.y(d));
		}
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		html = html.replace("HEADER3", h3);
		
		tip.html(html);
		
		if (d3.select(e).attr('class') == 'vz-corona-area') {
			tip.selectAll('.vz-tip-header2')
			 .style('color', function () {
				 return viz.getStyle('area-fill', [scope.data[i], i])
			 })
		}
		
		return [x1 - 100, y1 - 150];
		
	}
	
	return viz;
	
};