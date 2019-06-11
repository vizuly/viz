/*
Copyright (c) 2019, BrightPoint Consulting, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// @version 2.1.220

/**
 * @class
 */
vizuly2.viz.RadarChart = function (parent) {
	
	// Get the d3 library set by vizuly
	var d3 = vizuly2.d3;
	
	/** @lends vizuly2.viz.RadarChart.properties */
	var properties = {
		/**
		 * Array of Arrays. Each array represents a series of data.  Assumes each series contains all the datum properties referenced by each radial axis group of the radar chart.
		 * @member {Array}
		 * @default Needs to be set at runtime
		 *
		 * @example
		 *[
		 *  // Series 1
		 *  [
		 *    { "axis": "Appearance",  "value": 0.22, "category": "Ages 18-25" },
		 *    { "axis": "Speed", "value": 0.28, "category": "Ages 18-25"},
		 *    ...
		 *  ],
		 *  // Series 2
		 *  [
		 *    {"axis": "Appearance", "value": 0.27, "category": "Ages 26-35"},
		 *    {"axis": "Speed", "value": 0.16, "category": "Ages 26-35"},
		 *    ...
		 *  ],
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
		 * @default  {top:'5%', bottom:'5%', left:'8%', right:'10%'}
		 */
		'margin': {
			'top': '10%',
			'bottom': '10%',
			'left': '15%',
			'right': '15%'
		},
		/**
		 * Duration (in milliseconds) of any component transitions.
		 * @member {Number}
		 * @default  500
		 */
		'duration': 500,
		/**
		 * The dataTipRenderer is used to customize the data tip that is shown on mouse-over events.
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
		 *		var x1 = d3.event.pageX; - bounds.left;
		 *		var y1 = d3.event.pageY; - bounds.top;
		 *
		 *		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 *		 '<div class="vz-tip-header-rule"></div>' +
		 *		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 *		 '<div class="vz-tip-header-rule"></div>' +
		 *		 '<div class="vz-tip-header1"> HEADER3 </div>';
		 *
		 *		var h1, h2, h3;
		 *
		 *		if (d3.select(e).attr('class') == 'vz-radar-area') {
		 *		  h1=' ';
		 *		  h3=' ';
		 *		  h2 = scope.seriesLabel(scope.data[i][0]);
		 *			tip.style('height','50px')
		 *		}
		 *		else {
		 *			h1 = scope.seriesLabel(d);
		 *			h2 = scope.y(d);
		 *			h3 = scope.x(d);
		 *			tip.style('height','80px')
		 *		}
		 *
		 *		html = html.replace("HEADER1", h1);
		 *		html = html.replace("HEADER2", h2);
		 *		html = html.replace("HEADER3", h3);
		 *
		 *	  tip.html(html);
		 *
		 *		if (d3.select(e).attr('class') == 'vz-radar-area') {
		 *			tip.selectAll('.vz-tip-header2')
		 *			 .style('color', function () {
		 *				 return viz.getStyle('area-fill', [scope.data[i], i])
		 *			 })
		 *		}
		 *
		 *		return [x1 - 100, y1 - 120];
		 *}
		 */
		'dataTipRenderer': dataTipRenderer,
		/**
		 * Radius to position labels as a percentage of the components radius;
		 * @member {Number}
		 * @default  1.15 (115%)
		 */
		'labelRadiusPercent': 1.15,
		/**
		 * Scale type used to measure and position plots along the radial (y) axis. The scale, or scale properties can be overridden by capturing the
		 * "measure" event and accessing/modifying the scale.
		 * @member {d3.scale}
		 * @default d3.scaleLinear
		 * @example
		 * viz.on('measure', function () { viz.yScale().range([0, 600]) }) //Sets max width of scale to 600
		 */
		'yScale': d3.scaleLinear(),
		/**
		 * Function that returns the datum property used to calculate the value used by xScale and position radar vertex radially along 360 degrees.  This accessor is called for each vertex that is being rendered.
		 * @member {Function}
		 * @default  Must be set at runtime
		 * @example
		 * viz.x(function(d,i) { return Number(d.myProperty) });
		 */
		'x': null,
		/**
		 * Function that returns the datum property used to calculate the values used by the yScale to position radar vertex at a specified radius from center .  This accessor is called for each vertex that is being rendered.
		 * @member {Function}
		 * @default  Must be set at runtime
		 * @example
		 * viz.y(function(d,i) { return Number(d.myProperty) });
		 */
		'y': null,
		/**
		 * Function that returns the series label of the datum
		 * @member {Function}
		 * @default  function (d) { return d.series }
		 * @example
		 * viz.seriesLabel(function(d,i) { return d.myProperty });
		 */
		'seriesLabel': function (d) { return d.series },
		/**
		 * D3 Axis used to render x (radial) axis.  This axis can be overriden with custom settings by capturing the 'measure' event.
		 * @member {d3.axis}
		 * @default d3.axisLeft
		 * @example
		 * viz.on('measure', function () { viz.xAxis().tickSize(10) }) //Sets each axis tick to 10 pixels
		 */
		'xAxis': d3.axisBottom(),
		/**
		 * D3 Axis used to render y (radius) axis.  This axis can be overriden with custom settings by capturing the 'measure' event.
		 * @member {d3.axis}
		 * @default d3.axisBottom
		 * @example
		 * viz.on('measure', function () { viz.yAxis().tickSize(10) }) //Sets each axis tick to 10 pixels
		 */
		'yAxis': d3.axisLeft(),
		/**
		 * Scale type used to measure and position radar vertex points in a radial pattern around 360 degress.  The chart will try and auto-determine the scale type based on
		 * the value type being returned by the viz.y accessor.  String values will use a d3.scaleBand, date values will use a d3.scaleTime,
		 * and numeric values will use a d3.scaleLinear. The scale, or scale properties can be overridden by capturing the
		 * "measure" event and accessing/modifying the scale.
		 * @member {d3.scale}
		 * @default  undefined - set at runtime automatically
		 * @example
		 * viz.on('measure', function () { viz.xScale().range([0, 600]) }) //Sets max height of scale to 600;
		 */
		'xScale': "undefined",
		/**
		 * Label formatter for the y axis.  Can be customized to modify labels along axis.
		 * @member {function}
		 * @default function (d) { return d }
		 * @example
		 * //Sets each axis tick label to a currency format
		 * viz.yTickFormat(function (d, i) { return '$' + d3.format('.2f')(d) })
		 */
		'yTickFormat': function (d) {
			return d
		},
		/**
		 * Label formatter for the x axis.  Can be customized to modify labels along axis.
		 * @member {function}
		 * @default function (d) { return d }
		 * @example
		 * //Sets each axis tick label to a currency format
		 * viz.xTickFormat(function (d, i) { return '$' + d3.format('.2f')(d) })
		 */
		'xTickFormat': function (d) {
			return d
		},
		/**
		 * Curve shape for the Radar vertexes.   You can use any {@link 'https://github.com/d3/d3-shape#curves'|d3.curve} type
		 * @member {Object}
		 * @default d3.curveLinear
		 * @example
		 * //Sets a step curve type
		 * viz.curve(d3.curveStep)
		 */
		'curve': d3.curveLinearClosed
	};
	
	var styles = {
		'background-opacity': 1,
		'background-color-top': "#FFF",
		'background-color-bottom': "#EEE",
		'label-color': "#000",
		'line-stroke': function (d, i) {
			return d3.interpolateViridis(i/scope.data.length);
		},
		'line-stroke-over': function (d, i) {
			return d3.hsl(d3.interpolateViridis(i/scope.data.length)).darker();
		},
		'line-stroke-opacity': 0.8,
		'area-fill': function (d, i) {
			return d3.interpolateViridis(i/scope.data.length);
		},
		'area-fill-opacity': .5,
		'area-fill-opacity-over': .8,
		'x-axis-font-weight': 'normal',
		'x-axis-line-stroke': "#777",
		'x-axis-line-opacity': .5,
		'y-axis-line-stroke': "#777",
		'y-axis-line-opacity': .15,
		'y-axis-fill': '#777',
		'y-axis-fill-opacity': 0.05,
		'x-axis-font-size': function (d,i) { return Math.max(11, Math.round(outerRadius / 22)) }
	};
	
	/** @lends vizuly2.viz.RadarChart.events */
	var events = [
		/**
		 * Fires when user moves the mouse over a radar series group.
		 * @event vizuly2.viz.RadarChart.mouseover
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
		 * @event vizuly2.viz.RadarChart.mouseout
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
		 * Fires when user clicks on a given radar series.
		 * @event vizuly2.viz.RadarChart.click
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
		 * Fires when user moves mouse over a radar vertex.
		 * @event vizuly2.viz.RadarChart.vertex_mouseover
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
		 * Fires when user moves mouse off a radar vertex.
		 * @event vizuly2.viz.RadarChart.vertex_mouseout
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
	
	// Measurements
	
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
	var svg, g, xAxisPlot, yAxisPlot, plot, background, plotBackground, series, defs, pointHitArea;
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the individual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as D3 selections.
	function initialize() {
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.util.getDefs(viz);
		g = svg.append("g").attr("class", "vz-radar-chart");
		xAxisPlot = g.append("g").attr("class", "vz-xAxis-plot");
		yAxisPlot = g.append("g").attr("class", "vz-yAxis-plot");
		plot = g.append("g").attr("class", "vz-plot").attr("clip-path", "url(#" + scope.id + "_plotClipPath)");
		plotBackground = plot.append("rect").attr("class", "vz-plot-background");
		series = plot.append("g").attr("class", "vz-series");
		pointHitArea = g.append("g").attr("class", "vz-point-areas");
		
		// Make sure we have a default tick format - as we need to use these for our layout
		scope.yAxis.tickFormat(scope.yTickFormat);
		scope.xAxis.tickFormat(scope.xTickFormat);
		
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
		// We won't actually use a stacked layout, but this keeps a consistent design pattern for radial charts.
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
		var offset = vizuly2.util.stackOffsetBaseline;
		var order = d3.stackOrderAscending;
		
		// The d3.stack handles all of the d.x and d.y measurements for various stack layouts - we will let it do its magic here
		stack = d3.stack()
		 .keys(stackKeys)
		 .order(order)
		 .offset(offset);
		
		// Apply the stack magic to our data - note this is a destructive operation and assumes certain properties can be mutated (x, x0, y, y0)
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
		
		outerRadius = Math.round(Math.min(size.width, size.height)/2)
		innerRadius = 0;
		
		// Set our radius scale range
		scope.yScale.range([innerRadius, outerRadius]);
		
		// Set our radius scale domain based on the data values
		scope.yScale.domain([d3.min(stackSeries, stackMin), d3.max(stackSeries, stackMax)]);
		
		// Set our area path generator properties
		area.curve(scope.curve)
		 .angle(function (d) {
			 return scope.xScale(d.data.x);
		 })
		 .innerRadius(function (d, i) {
			 return scope.yScale(d[0]);
		 })
		 .outerRadius(function (d, i) {
			 return scope.yScale(d[1]);
		 });
		
		// Set our line path generator properties
		line.curve(scope.curve)
		 .angle(function (d) {
			 return scope.xScale(d.data.x);
		 })
		 .radius(function (d, i) {
			 return scope.yScale(d[1]);
		 });
		
		var tickCount = scope.xScale.domain().length;
		
		scope.yAxis.scale(scope.yScale);
		scope.yAxis.tickSize(outerRadius).ticks(4);
		scope.xAxis.scale(scope.xScale).tickSize(outerRadius);
		
		// Calculate our tick step based on number of ticks we have and length of data.
		xAxisTickStep = Math.round(stackSeries[0].length / tickCount);
		
		xAxisTickData = scope.xScale.domain();
		
		// Measure the tipRadius (used to detect interaction events)
		tipRadius = Math.min(size.width / 50, size.height / 50);
		
		scope.size = size;
		
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
		xAxisPlot.attr("transform", "translate(" + (size.left + size.width / 2) + "," + (size.height / 2 + size.top) + ")");
		yAxisPlot.attr("transform", "translate(" + (size.left + size.width / 2) + "," + (size.height / 2 + size.top) + ")");
		plotBackground.attr("width", size.width).attr("height", size.height);
		
		var seriesArea = series.selectAll(".vz-radar-area").data(stackSeries);
		seriesArea.exit().remove();
		seriesArea = seriesArea
		 .enter()
		 .append("path")
		 .attr("class", "vz-radar-area")
		 .on("mouseover", function (d, i) {
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
			 .on("mouseout", function (d, i) {
				 scope.dispatch.apply('vertex_mouseout', viz, [this, scope.data[j][i], i, j]);
			 })
			
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
		
		xAxisPlot.selectAll(".vz-radar-x-axis-tick").remove();
		var xTicks = xAxisPlot.selectAll(".vz-radar-x-axis-tick")
		 .data(xAxisTickData)
		 .enter().append("g")
		 .attr("class", "vz-radar-x-axis-tick");
		
		xTicks.append("circle")
		 .attr('r', Math.round(tipRadius * .6))
		 .attr('cx',function (d,i) { return outerRadius * Math.cos(scope.xScale(d) - Math.PI/2)})
		 .attr('cy', function (d,i) { return outerRadius * Math.sin(scope.xScale(d) - Math.PI/2)})
		 .style('stroke', '#EEE')
		
		xTicks.append("line")
		 .attr('x1',0)
		 .attr('x2',function (d,i) { return outerRadius * Math.cos(scope.xScale(d) - Math.PI/2)})
		 .attr('y1',0)
		 .attr('y2', function (d,i) { return outerRadius * Math.sin(scope.xScale(d) - Math.PI/2)})
		 .style('stroke', '#FFF')
		
		xTicks.append("text")
		 .attr('class','vz-radar-x-axis-label')
		 .attr('x',function (d,i) { return ((outerRadius + tipRadius) * scope.labelRadiusPercent) * Math.cos(scope.xScale(d) - Math.PI/2)})
		 .attr('y', function (d,i) { return ((outerRadius + tipRadius) * scope.labelRadiusPercent) * Math.sin(scope.xScale(d) - Math.PI/2)})
		 .attr('dy',function (d,i) { return (viz.getStyle('x-axis-font-size', arguments) * 1.2) + 'px'})
		 .style('font-size',function (d,i) { return viz.getStyle('x-axis-font-size', arguments) + 'px'})
		 .text(function (d,i) { return scope.xTickFormat(d); })
		 .style('text-anchor','middle')
		 .call(wrap, outerRadius/4)
		
		
		
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
			 return scope.yScale(d)
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
				 return vizuly2.svg.text.textArcPath(scope.yScale(tick) * 1.02, 0)
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
				 return scope.yTickFormat(tick);
			 })
		});
		
		// Let everyone know we are done updating.
		scope.dispatch.apply('updated', viz);
		
	}
	
	// Used to translate from cartesian coordinates to polar coordinates.
	function cartesianToPolar(x, y) {
		var r = scope.yScale(x);
		var a = scope.xScale(y) - Math.PI / 2;
		x = r * Math.cos(a) + size.width / 2;
		y = r * Math.sin(a) + size.height / 2;
		return ({x: x, y: y});
	}
	
	function wrap(text, width) {
		text.each(function() {
			var text = d3.select(this),
			 words = text.text().split(/\s+/).reverse(),
			 word,
			 line = [],
			 lineNumber = 0,
			 x = text.attr("x"),
			 dy = parseFloat(text.attr("dy")),
			 y = text.attr("y") - dy,
			 lineHeight = dy,
			 tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "px");
			
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width && words.length > 1) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "px").text(word);
				}
			}
			text.selectAll('tspan').attr("y",y - ((lineNumber) * dy))
		})
	};
	
	/**
	 *  Triggers the render pipeline process to refresh the component on the screen.
	 *  @method  vizuly2.viz.RadarChart.update
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
		selection.selectAll(".vz-radar-area")
		 .style("fill", function (d, i) {
			 return viz.getStyle('area-fill', arguments);
		 })
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('area-fill-opacity', arguments)
		 })
		 .style("stroke", function (d, i) {
			 return viz.getStyle('line-stroke', arguments);
		 })
		 .style("stroke-opacity", function (d, i) {
			 return viz.getStyle('line-stroke-opacity', arguments)
		 });
		
		
		// Hide all the data points
		selection.selectAll(".vz-data-point").style("opacity", 0);
		
		// Update the x axis ticks
		selection.selectAll(".vz-radar-x-axis-tick")
		 .style("font-weight", function (d, i) {
			 return viz.getStyle('x-axis-font-weight', arguments)
		 })
		 .style("fill", function (d, i) {
			 return viz.getStyle('label-color', arguments)
		 })
		 .style("font-size", Math.max(8, Math.round(outerRadius / 25)) + "px");
		
		// Update the x-axis ticks
		selection.selectAll(".vz-radar-x-axis-tick line")
		 .style("stroke", function (d, i) {
			 return viz.getStyle('x-axis-line-stroke', arguments)
		 })
		 .style("stroke-width", 1)
		 .style("opacity", function (d, i) {
			 return viz.getStyle('x-axis-line-opacity', arguments)
		 })
		
		selection.selectAll(".vz-radar-x-axis-tick circle")
		 .style("fill", function (d, i) {
			 return viz.getStyle('x-axis-line-stroke', arguments)
		 })
		 .style("opacity", function (d, i) {
			 return viz.getStyle('x-axis-line-opacity', arguments)
		 })
		
		
		// Update the y-axis ticks
		selection.selectAll(".vz-y-axis-tick")
		 .style("stroke", function (d, i) {
			 return viz.getStyle('y-axis-line-stroke', arguments)
		 })
		 .style("stroke-width", 1)
		 .style("stroke-opacity", function (d, i) {
			 return viz.getStyle('y-axis-line-opacity', arguments)
		 })
		 .style("fill", function (d, i) {
			 return viz.getStyle('y-axis-fill', arguments)
		 })
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('y-axis-fill-opacity', arguments)
		 })
		
		// Update the y-axis tick labels
		selection.selectAll(".vz-y-axis-tick-label")
		 .style("font-size", Math.max(8, Math.round(outerRadius / 30)) + "px")
		 .style("fill", function (d, i) {
			 return viz.getStyle('label-color', arguments)
		 })
		
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function styles_onMouseOver(e, d, i) {
		
		// Animate reduced opacity on area path
		plot.selectAll(".vz-radar-area").transition('styles_mouseover')
		 .style("fill-opacity", function (datum, index) {
			 return (i == index) ? viz.getStyle('area-fill-opacity-over', arguments) : .2
		 })
		.style("stroke-opacity", function (datum, index) {
			return (i == index) ? viz.getStyle('area-fill-opacity-over', arguments) : .2
		});
		
		pointHitArea.selectAll('.vz-point-tip').remove();
		
		pointHitArea.selectAll('.vz-tip.series_' + i)
		 .each(function (d,i) {
			 d3.select(this).append("circle")
				.attr("class", "vz-point-tip").attr("r", 4).style("fill", "#000").style("stroke", "#FFF").style("stroke-width", 2).style("pointer-events", "none");
		 })
		
		viz.showDataTip(e, d, i);
		
	}
	
	function styles_onMouseOut(e, d, i) {
		// Animate area opacity back to original
		plot.selectAll(".vz-radar-area").transition('styles_mouseover')
		 .style("fill-opacity", function (d,i) { return viz.getStyle('area-fill-opacity', arguments)})
		 .style("stroke-opacity", function (d,i) { return viz.getStyle('area-fill-opacity', arguments)});
		
		pointHitArea.selectAll('.vz-point-tip').remove();
		
		viz.removeDataTip();
	}
	
	
	// This runs on every mouse over
	function styles_vertexOnMouseOver(e, d, i, j) {

		var selection = scope.selection;
		
		var datum = stackSeries[j][i];
		
		// Animate reduced opacity on area path
		selection.selectAll(".vz-radar-area").transition('styles_mouseover')
		 .style("fill-opacity", function (d, i) {
			 return (i == j) ? viz.getStyle('area-fill-opacity-over', arguments) : .2
		 })
		 .style("stroke-opacity", function (datum, index) {
			 return (i == j) ? viz.getStyle('area-fill-opacity-over', arguments) : .2
		 });
		
		// Set the stroked dash highlight
		plot.append("circle").attr("class", "vz-y-axis-mouseover")
		 .attr("cx", 0)
		 .attr("cy", 0)
		 .attr("r", function () {
			 return scope.yScale(datum[1])
		 })
		 .style("stroke", viz.getStyle('x-axis-line-stroke'))
		 .style("fill", "none")
		 .style("stroke-dasharray", function () {
			 return outerRadius / 80 + "," + outerRadius / 80
		 });
		
		// Remove any previous point tips
		selection.selectAll(".vz-point-tip").remove();
		
		// Add a highlight circle
		d3.select(e).append("circle")
		 .attr("class", "vz-point-tip").attr("r", 4).style("fill", "#000").style("stroke", "#FFF").style("stroke-width", 2).style("pointer-events", "none");
		
		xAxisPlot.selectAll('.vz-radar-x-axis-label').filter(function (d,index) { return index == i })
		 .transition()
		 .style('font-size',(viz.getStyle('x-axis-font-size') * 1.25) + 'px')
		 .style('font-weight', 'bold');
		
		xAxisPlot.selectAll('.vz-radar-x-axis-tick line').filter(function (d,index) { return index == i })
		 .style('opacity', 1)
		
		xAxisPlot.selectAll('.vz-radar-x-axis-tick circle').filter(function (d,index) { return index == i })
		 .style('opacity', 1)
		
		viz.showDataTip(e, d, i);
	}
	
	// This runs on every mouse out
	function styles_vertexOnMouseOut(e, d, i, j) {
		
		var selection = scope.selection;
		
		// Animate area opacity back to original
		selection.selectAll(".vz-radar-area")
		 .transition('styles_mouseover')
		 .style("fill-opacity", function (d,i) { return viz.getStyle('area-fill-opacity', arguments) })
		 .style("stroke-opacity", function (d,i) { return viz.getStyle('area-fill-opacity', arguments)});
		
		// Remove dashed line highlight
		selection.selectAll(".vz-y-axis-mouseover").remove();
		
		// Remove the data tip
		selection.selectAll(".vz-point-tip").remove();

		xAxisPlot.selectAll('.vz-radar-x-axis-label')
		 .transition()
		 .style('font-size',(viz.getStyle('x-axis-font-size')) + 'px')
		 .style('font-weight', 'normal');
		
		xAxisPlot.selectAll('.vz-radar-x-axis-tick line, circle')
		 .style('opacity', viz.getStyle('x-axis-line-opacity'))
		
		viz.removeDataTip();
		
	}
	
	function dataTipRenderer(tip, e, d, i, j, x, y) {
		
		var bounds = e.getBoundingClientRect();
		var x1 = d3.event.pageX; - bounds.left;
		var y1 = d3.event.pageY; - bounds.top;
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header1"> HEADER3 </div>';
		
		var h1, h2, h3;
		
		if (d3.select(e).attr('class') == 'vz-radar-area') {
		  h1=' ';
		  h3=' ';
		  h2 = scope.seriesLabel(scope.data[i][0]);
			tip.style('height','50px')
		}
		else {
			h1 = scope.seriesLabel(d);
			h2 = scope.y(d);
			h3 = scope.x(d);
			tip.style('height','80px')
		}
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		html = html.replace("HEADER3", h3);
	
	  tip.html(html);
		
		if (d3.select(e).attr('class') == 'vz-radar-area') {
			tip.selectAll('.vz-tip-header2')
			 .style('color', function () {
				 return viz.getStyle('area-fill', [scope.data[i], i])
			 })
		}
		
		return [x1 - 100, y1 - 120];
		
	}
	
	
	// Returns viz component :)
	return viz;
}