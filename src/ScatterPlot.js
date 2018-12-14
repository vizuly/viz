/*
 Copyright (c) 2019, BrightPoint Consulting, Inc.
 
 All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// @version 2.1.85

/**
 * @class
 */
vizuly2.viz.ScatterPlot = function (parent) {
	
	var d3 = vizuly2.d3;
	
	/** @lends vizuly2.viz.ScatterPlot.properties */
	var properties = {
		/**
		 * Array of datums to be ploted.
		 * @member {Array}
		 * @default Needs to be set at runtime
		 *
		 * @example
		 * [
		 *   {"xValue": 20, "yValue": 20, "rValue": 30, "category": "Gold"},
		 *   {"xValue": 40, "yValue": 50, "rValue": 60, "category": "Silver"},
		 *   ...
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
			'bottom': '7%',
			'left': '12%',
			'right': '9%'
		},
		/**
		 * Duration (in milliseconds) of any component transitions.
		 * @member {Number}
		 * @default  500
		 */
		'duration': 500,
		/**
		 * Function that returns the datum property used to calculate the X position of the plot.  This accessor is called for each plot that is being rendered.
		 * @member {Function}
		 * @default  Must be set at runtime
		 * @example
		 * viz.x(function(d,i) { return Number(d.myProperty) });
		 */
		'x': null,
		/**
		 * Function that returns the datum property used to calculate the y position of the plot.  This accessor is called for each plot that is being rendered.
		 * @member {Function}
		 * @default  Must be set at runtime
		 * @example
		 * viz.y(function(d,i) { return Number(d.myProperty) });
		 */
		'y': null,
		/**
		 * Function that returns the datum property used to calculate the radius of the plot.  This accessor is called for each plot that is being rendered.
		 * @member {Function}
		 * @default  Must be set at runtime
		 * @example
		 * viz.y(function(d,i) { return Number(d.myProperty) });
		 */
		'r': null,                               // Function that returns rScale data value
		/**
		 * Scale type used to measure and position plots along the x-axis.  The chart will try and auto-determine the scale type based on
		 * the value type being returned by the viz.y accessor.  String values will use a d3.scaleBand, date values will use a d3.scaleTime,
		 * and numeric values will use a d3.scaleLinear. The scale, or scale properties can be overridden by capturing the
		 * "measure" event and accessing/modifying the scale.
		 * @member {d3.scale}
		 * @default undefined - set at runtime automatically
		 * @example
		 * viz.on('measure', function () { viz.xScale().range([0, 600]) }) //Sets max width of scale to 600
		 */
		'xScale': 'undefined',
		/**
		 * Scale type used to measure and position plots along the y-axis.  The chart will try and auto-determine the scale type based on
		 * the value type being returned by the viz.y accessor.  String values will use a d3.scaleBand, date values will use a d3.scaleTime,
		 * and numeric values will use a d3.scaleLinear. The scale, or scale properties can be overridden by capturing the
		 * "measure" event and accessing/modifying the scale.
		 * @member {d3.scale}
		 * @default  undefined - set at runtime automatically
		 * @example
		 * viz.on('measure', function () { viz.yScale().range([0, 600]) }) //Sets max height of scale to 600;
		 */
		'yScale': 'undefined',
		/**
		 * Scale type used to measure the radius of each plot.  The chart will try and auto-determine the scale type based on
		 * the value type being returned by the viz.y accessor.  String values will use a d3.scaleBand, date values will use a d3.scaleTime,
		 * and numeric values will use a d3.scaleLinear. The scale, or scale properties can be overridden by capturing the
		 * "measure" event and accessing/modifying the scale.
		 * @member {d3.scale}
		 * @default  undefined - set at runtime automatically
		 * @example
		 * viz.on('measure', function () { viz.yScale().range([0, 600]) }) //Sets max height of scale to 600;
		 */
		'rScale': 'undefined',
		/**
		 * D3 Axis used to render x (bottom) axis.  This axis can be overriden with custom settings by capturing the 'measure' event.
		 * @member {d3.axis}
		 * @default d3.axisBottom
		 * @example
		 * viz.on('measure', function () { viz.xAxis().tickSize(10) }) //Sets each axis tick to 10 pixels
		 */
		'xAxis': d3.axisBottom(),
		/**
		 * D3 Axis used to render y (left) axis.  This axis can be overriden with custom settings by capturing the 'measure' event.
		 * @member {d3.axis}
		 * @default d3.axisLeft
		 * @example
		 * viz.on('measure', function () { viz.yAxis().tickSize(10) }) //Sets each axis tick to 10 pixels
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
		 * // x - suggested x position of data tip
		 * // y - suggested y position of data tip
		 * // return {Array} [x, y] - x and y coordinates placing data tip.
		 *
		 *function dataTipRenderer(tip, e, d, i, x, y) {
		 *     tip.style('text-align', 'center').append('div').text(scope.y(d));
		 *     return [x-50, y-80];
		 *}
		 */
		'dataTipRenderer': dataTipRenderer
	};
	
	var styles = {
		'background-opacity': 1,
		'background-top': '#FFF',
		'background-bottom': '#DDD',
		'y-axis-label-show': true,
		'x-axis-label-show': true,
		'y-axis-font-style': 'normal',
		'x-axis-font-style': 'normal',
		'y-axis-label-color': '#444',
		'x-axis-label-color': '#444',
		'axis-stroke': '#777',
		'axis-opacity': .5,
		'axis-font-size': function (d, i) {
			return Math.max(10, Math.round(size.width / 65))
		},
		'node-stroke': function (d, i) {
			return '#777';
		},
		'node-stroke-width': 1,
		'node-fill': function (d, i) {
			var axisColors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return axisColors[i % axisColors.length]
		},
		'node-fill-opacity': function (d, i) {
			return .7;
		},
		'node-stroke-opacity': .25,
		'node-stroke-over': '#000',
		'node-stroke-width-over': 2,
		'node-stroke-opacity-over': .8,
		'node-fill-over': function (d, i) {
			return '#FFF';
		},
		'node-fill-opacity-over': function (d, i) {
			return .9;
		}
	};
	
	/** @lends vizuly2.viz.ScatterPlot.events */
	var events = [
		/**
		 * Fires when user moves the mouse over a plot
		 * @event vizuly2.viz.ScatterPlot.mouseover
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
		 * Fires when user moves the mouse off plot.
		 * @event vizuly2.viz.ScatterPlot.mouseout
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
		 * Fires when user clicks on a given plot.
		 * @event vizuly2.viz.ScatterPlot.click
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param j -  The series index of the datum
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
	
	//Measurements
	var size;           // Holds the 'size' variable as defined in viz.util.size()
	var plotMaxRadius;  // Holds the maximium radius for all plots
	
	//These are all d3.selection objects we use to insert and update svg elements into
	var svg, g, bottomAxis, leftAxis, plot, plots, background, plotBackground, defs;
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the individual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.core.util.getDefs(viz);
		g = svg.append("g").attr("class", "vz-scatter-viz");
		bottomAxis = g.append("g").attr("class", "vz-bottom-axis").attr("clip-path", "url(#" + scope.id + "_xClipPath)").append("g");
		leftAxis = g.append("g").attr("class", "vz-left-axis");
		plot = g.append("g").attr("class", "vz-scatter-plot").attr("clip-path", "url(#" + scope.id + "_plotClipPath)");
		plotBackground = plot.append("rect").attr("class", "vz-plot-background").style("fill", "#FFF").style("fill-opacity", .01);
		
		// Tell everyone we are done initializing
		scope.dispatch.apply('initialized', viz);
		
	}
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		// If our scales have not been defined yet, then we will default them based on the data values.
		if (scope.xScale == "undefined") {
			scope.xScale = vizuly2.core.util.getTypedScale(scope.x(scope.data[0]));
		}
		
		if (scope.yScale == "undefined") {
			scope.yScale = vizuly2.core.util.getTypedScale(scope.y(scope.data[0]));
		}
		
		if (scope.rScale == "undefined") {
			scope.rScale = vizuly2.core.util.getTypedScale(scope.r(scope.data[0]));
		}
		
		// Set the domain values for the scale
		setScaleDomain(scope.xScale, scope.x, scope.data);
		setScaleDomain(scope.yScale, scope.y, scope.data);
		setScaleDomain(scope.rScale, scope.r, scope.data);
		
		// Determine the plot max radius based on the size of the viz
		plotMaxRadius = Math.min(size.width, size.height) / 20;
		
		// Set the ranges of our scales based on the viz size and max plot radius
		scope.yScale.range([size.height - plotMaxRadius, plotMaxRadius]);
		scope.xScale.range([plotMaxRadius, size.width - plotMaxRadius]);
		scope.rScale.range([1, plotMaxRadius]);
		
		// Default our x and y axis
		scope.xAxis.scale(scope.xScale).tickFormat(scope.xTickFormat).tickSize(viz.getStyle('axis-font-size')/2)
		scope.yAxis.scale(scope.yScale).tickFormat(scope.yTickFormat).tickSize(-vizuly2.core.util.size(scope.margin, size.measuredWidth, size.measuredHeight).width).ticks(5)
		
		scope.size = size;
		
		// Tell everyone we are done making our measurements
		scope.dispatch.apply('measured', viz);
		
	}
	
	// The update function is the primary function that is called when we want to render the visualiation based on
	// all of its set properties.  A developer can change properties of the components and it will not show on the screen
	// until the update function is called
	function update() {
		
		// Call measure each time before we update to make sure all our our layout properties are set correctly
		measure();
		
		// Layout all of our primary SVG d3.elements.
		svg.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		background.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		plot.style("width", size.width).style("height", size.height).attr("transform", "translate(" + (size.left + plotMaxRadius) + "," + size.top + ")");
		bottomAxis.attr("transform", "translate(" + (size.left) + "," + (size.height + size.top) + ")");
		leftAxis.attr("transform", "translate(" + size.left + "," + size.top + ")");
		plotBackground.attr("width", size.width).attr("height", size.height);
		
		// Create our plots using the select, enter, exit pattern
		plots = plot.selectAll(".vz-scatter-node").data(scope.data);
		
		// Remove any plots that are no longer in the data set
		plots.exit().remove();
		
		// Set plots to initially be at the bottom of the plot in the correct x position with a 0 radius
		var enter = plots.enter().append("circle")
		 .attr("class", "vz-scatter-node")
		 .attr("r", 10)
		 .attr("cx", function (d, i) {
			 return scope.xScale(scope.x(d))
		 })
		 .attr("cy", function (d, i) {
			 return size.height;
		 })
		 .on("mouseover", function (d, i) {
			 scope.dispatch.apply('mouseover', viz, [this, d, i]);
		 })
		 .on("mouseout", function (d, i) {
			 scope.dispatch.apply('mouseout', viz, [this, d, i]);
		 })
		 .on("click", function (d, i) {
			 scope.dispatch.apply('click', viz, [this, d, i]);
		 })
		
		
		// Animate the plots to the correct cx, cy and radius
		
		enter
		 .transition('update')
		 .duration(scope.duration)
		 .attr("cx", function (d, i) {
			 return scope.xScale(scope.x(d))
		 })
		 .attr("cy", function (d, i) {
			 return scope.yScale(scope.y(d))
		 })
		 .attr("r", function (d, i) {
			 return scope.rScale(scope.r(d))
		 });
		
		plots
		 .transition('update').duration(scope.duration)
		 .attr("cx", function (d, i) {
			 return scope.xScale(scope.x(d))
		 })
		 .attr("cy", function (d, i) {
			 return scope.yScale(scope.y(d))
		 })
		 .attr("r", function (d, i) {
			 return scope.rScale(scope.r(d))
		 });
		
		
		// Update our axis labels
		bottomAxis.call(scope.xAxis);
		leftAxis.call(scope.yAxis);
		
		// Let everyone know we are doing doing our update
		// Typically themes will attach a callback to this event so they can apply styles to the elements
		scope.dispatch.apply('updated', viz);
		
	}
	
	// A utility function that sets the scale's domains based on data type
	function setScaleDomain(scale, value, data) {
		if (typeof value(data[0]) == "string") {
			scale.domain(data.map(function (d) {
				return value(d);
			}));
		}
		else {
			scale.domain([d3.min(data, function (d) {
				return value(d);
			}), d3.max(data, function (d) {
				return value(d);
			})]);
		}
	}
	
	// This is our public update call that all viz components implement
	viz.update = function () {
		update();
		return viz;
	};
	
	// styless and styles
	var stylesCallbacks = [
		{on: 'updated.styles', callback: applyStyles},
		{on: 'mouseover.styles', callback: styles_onMouseOver},
		{on: 'mouseout.styles', callback: styles_onMouseOut}
	];
	
	viz.applyCallbacks(stylesCallbacks);
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		var selection = scope.selection;
		
		// Update the background
		var styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-bottom'), viz.getStyle('background-top'));
		
		// Update the background
		selection.selectAll(".vz-background").style("fill", function () {
			return "url(#" + styles_backgroundGradient.attr("id") + ")";
		})
		 .style('opacity',viz.getStyle('background-opacity'));
		
		// Update the scatter plots
		selection.selectAll(".vz-scatter-node")
		 .style("stroke", function (d, i) {
			 return viz.getStyle('node-stroke', arguments)
		 })
		 .style("stroke-width", function (d, i) {
			 return viz.getStyle('node-stroke-width', arguments)
		 })
		 .style("stroke-opacity", function (d, i) {
			 return viz.getStyle('node-stroke-opacity', arguments)
		 })
		 .style("fill", function (d, i) {
			 return viz.getStyle('node-fill', arguments)
		 })
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('node-fill-opacity', arguments)
		 })
		
		// Update axis fonts
		selection.selectAll('.vz-bottom-axis text, .vz-left-axis text')
		 .style('font-weight', function () {
			 return viz.getStyle('axis-font-weight', arguments)
		 })
		 .style('font-size', function () {
			 return viz.getStyle('axis-font-size', arguments) + 'px'
		 })
		
		selection.selectAll('.vz-bottom-axis text')
		 .style('display', function () {
			 return viz.getStyle('x-axis-label-show', arguments) ? 'block' : 'none'
		 })
		 .style('font-style', function () {
			 return viz.getStyle('x-axis-font-style', arguments)
		 })
		 .attr('dy', function (d, i) {
			 return (viz.getStyle('axis-font-size', arguments)) + 'px';
		 })
		 .style('font-size', function (d, i) {
			 return viz.getStyle('axis-font-size', arguments) + 'px'
		 })
		 .style('fill', function () {
			 return viz.getStyle('x-axis-label-color', arguments)
		 })
		 .style('text-anchor', 'middle')
		
		
		selection.selectAll('.vz-left-axis text')
		 .style('display', function () {
			 return viz.getStyle('y-axis-label-show', arguments) ? 'block' : 'none'
		 })
		 .style('font-style', function () {
			 return viz.getStyle('y-axis-font-style', arguments)
		 })
		 .style('font-size', function (d, i) {
			 return viz.getStyle('y-axis-font-size', arguments) + 'px'
		 })
		 .style('fill', function () {
			 return viz.getStyle('y-axis-label-color', arguments)
		 })
		
		// Update axis strokes
		selection.selectAll('.vz-bottom-axis line, .vz-left-axis line')
		 .style('stroke', function () {
			 return viz.getStyle('axis-stroke')
		 })
		 .style('stroke-width', 1)
		 .style('opacity', function () {
			 return viz.getStyle('axis-opacity')
		 })
		
		selection.selectAll('.vz-left-axis').attr('font-family', null)
		selection.selectAll('.vz-bottom-axis').attr('font-family', null)
		selection.selectAll('.vz-left-axis path.domain').style('display', 'none');
		selection.selectAll('.vz-bottom-axis path.domain').style('display', 'none');
	//	selection.selectAll('.vz-bottom-axis line').style('display', 'none');
		
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function styles_onMouseOver(node, d, i) {
		
		
		d3.select(node)
		 .style("stroke", function (d, i) {
			 return viz.getStyle('node-stroke-over', arguments)
		 })
		 .style("stroke-width", function (d, i) {
			 return viz.getStyle('node-stroke-width-over', arguments)
		 })
		 .style("stroke-opacity", function (d, i) {
			 return viz.getStyle('node-stroke-opacity-over', arguments)
		 })
		 .style("fill", function (d, i) {
			 return viz.getStyle('node-fill-over', arguments)
		 })
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('node-fill-opacity-over', arguments)
		 })
		
		viz.showDataTip(node, d, i);
		
	}
	
	//On <code>mouseout</code> we want to undo any changes we made on the <code>mouseover</code>.
	function styles_onMouseOut(node, d, i) {
		plot.selectAll(".vz-scatter-node")
		 .style("stroke", function (d, i) {
			 return viz.getStyle('node-stroke', arguments)
		 })
		 .style("stroke-width", function (d, i) {
			 return viz.getStyle('node-stroke-width', arguments)
		 })
		 .style("stroke-opacity", function (d, i) {
			 return viz.getStyle('node-stroke-opacity', arguments)
		 })
		 .style("fill", function (d, i) {
			 return viz.getStyle('node-fill', arguments)
		 })
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('node-fill-opacity', arguments)
		 })
		
		viz.removeDataTip();
		
		//	plot.selectAll(".vz-scatter-node")
		//	 .style("opacity",1)
	}
	
	function dataTipRenderer(tip, e, d, i, x, y) {
		tip.style('text-align', 'center').append('div').text(scope.y(d));
		return [x-50, y-80];
	}
	
	return viz;
	
};