/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 This source code is covered under the following license: http://vizuly2.io/commercial-license/
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.45

/**
 * A base vizuly component used as a template for creating other components.
 * @class
 * @constructor
 * @param {DOMElement} parent - Container element that will render the component.
 *
 */
vizuly2.viz.RadarChart = function (parent) {
	
	// This is the object that provides pseudo "protected" properties that the vizuly.viz function helps create
	var scope = {};
	
	/** @lends vizuly2.viz.Corona.properties */
	var properties = {
		/**
		 * Hierarchal nested array of nodes to be rendered.
		 * @member {Array}
		 */
		"data": null,                          //Expects array of data - assumes identical length and xScale values;
		"margin": {                             // Our margin object
			"top": "10%",                        // Top margin
			"bottom": "10%",                     // Bottom margin
			"left": "10%",                       // Left margin
			"right": "10%"                       // Right margin
		},
		"duration": 500,                        // This the time in ms used for any component generated transitions
		"width": 300,                           // Overall width of component
		"height": 300,                          // Height of component
		"labelRadiusFactor": 1.15,
		"radiusScale": d3.scaleLinear(),      // Radius scale (defaults to linear)
		"y": null,                             // Function to return 'y' value - cartesian y translates to distance from center in polar coordinates.
		"x": null,                              // Function to return 'x' value - cartesian x translates to the angle from 0 degrees around the center of corona.
		"seriesLabel": function (d) { return d.series },
		"yAxis": d3.axisLeft(),                // Axis shown along perimeter of the corona
		"xAxis": d3.axisBottom(),                // Axis shown radiating out from center of corona
		"xScale": "undefined",             // The scale to determine the distribution of angles around the center for each 'x' plot
		"yAxisTickFormat": function (d,i) { return d },
		"xAxisTickFormat": function (d,i) { return d },
		"curve": d3.curveLinearClosed    // Used to determine vertex type of lines
	};
	
	var styles = {
		'label-color': "#000",
		'value-label-font-size': function (d,i) { return Math.max(8, Math.round(outerRadius / 15)) },
		'color': "#02C3FF",
		'background-gradient-top': "#FFF",
		'background-gradient-bottom': "#EEE",
		'line-stroke': function (d, i) {
			return d3.interpolateViridis(i/scope.data.length);
		},
		'line-stroke-over': function (d, i) {
			return d3.hsl(d3.interpolateViridis(i/scope.data.length)).darker();
		},
		'line-opacity': 0.8,
		'area-fill': function (d, i) {
			return d3.interpolateViridis(i/scope.data.length);
		},
		'area-fill-opacity': .5,
		'x-axis-font-weight': 200,
		'x-axis-line-stroke': "#777",
		'x-axis-line-opacity': .5,
		'y-axis-line-stroke': "#777",
		'y-axis-line-opacity': .15,
		'x-axis-font-size': function (d,i) { return Math.max(8, Math.round(outerRadius / 22)) }
	};
	
	
	//Create our viz and type it
	var viz = vizuly2.core.component(parent, scope, properties, styles);
	
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
	
	initialize();
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the individual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as D3 selections.
	function initialize() {
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.core.util.getDefs(viz);
		g = svg.append("g").attr("class", "vz-corona-viz");
		xAxisPlot = g.append("g").attr("class", "vz-xAxis-plot");
		yAxisPlot = g.append("g").attr("class", "vz-yAxis-plot");
		plot = g.append("g").attr("class", "vz-plot").attr("clip-path", "url(#" + scope.id + "_plotClipPath)");
		plotBackground = plot.append("rect").attr("class", "vz-plot-background");
		series = plot.append("g").attr("class", "vz-series");
		pointHitArea = g.append("g").attr("class", "vz-point-areas");
		
		// Make sure we have a default tick format - as we need to use these for our layout
		scope.yAxis.tickFormat(scope.yAxisTickFormat);
		scope.xAxis.tickFormat(scope.xAxisTickFormat);
		
		// Tell everyone we are done initializing.
		scope.dispatch.apply('initialize', viz);
	}
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		console.log("remove stacks from spider chart")
		
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
		var offset = vizuly2.core.util.stackOffsetBaseline;
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
		
		var tickCount = scope.xScale.domain().length;
		
		scope.yAxis.scale(scope.radiusScale);
		scope.yAxis.tickSize(outerRadius).ticks(4);
		scope.xAxis.scale(scope.xScale).tickSize(outerRadius);
		
		// Calculate our tick step based on number of ticks we have and length of data.
		xAxisTickStep = Math.round(stackSeries[0].length / tickCount);
		
		xAxisTickData = scope.xScale.domain();
		
		// Measure the tipRadius (used to detect interaction events)
		tipRadius = Math.min(size.width / 50, size.height / 50);
		
		// Tell everyone we are done measuring.
		scope.dispatch.apply('measure', viz);
		
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
		
		var seriesArea = series.selectAll(".vz-area").data(stackSeries);
		seriesArea.exit().remove();
		seriesArea = seriesArea.enter().append("path").attr("class", "vz-area").merge(seriesArea)
		
		seriesArea
		 .transition()
		 .duration(scope.duration)
		 .attr("d", area)
		
		
		var seriesLine = series.selectAll(".vz-line").data(stackSeries);
		seriesLine.exit().remove();
		seriesLine = seriesLine.enter().append("path").attr("class", "vz-line").merge(seriesLine)
		
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
			 .append("g").attr("class", "vz-tip")
			 .attr("transform", function (d, i) {
				 var point = cartesianToPolar(d[1], d.data.x);
				 return "translate(" + point.x + "," + point.y + ")"
			 })
			 .on("mouseover", function (d, i) {
				 scope.dispatch.apply('mouseover', viz, [this, scope.data[j][i], i, j]);
			 })
			 .on("touchstart", function (d, i) {
				 scope.dispatch.apply('mouseover', viz, [this, scope.data[j][i], i, j]);
			 })
			 .on("mouseout", function (d, i) {
				 scope.dispatch.apply('mouseout', viz, [this, scope.data[j][i], i, j]);
			 })
			 .on("mousedown", function (d, i) {
				 scope.dispatch.apply('mousedown', viz, [this, scope.data[j][i], i, j]);
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
			 return vizuly2.svg.text.textArcPath(scope.outerRadius * 1.05, scope.xScale(scope.x(scope.data[0][i * xAxisTickStep])));
		 });
		
		// Create xAxis Labels using the def arc paths we created above
		xAxisPlot.selectAll(".vz-spider-x-axis-tick").remove();
		var xTicks = xAxisPlot.selectAll(".vz-spider-x-axis-tick")
		 .data(xAxisTickData)
		 .enter().append("g")
		 .attr("class", "vz-spider-x-axis-tick");
		
		xTicks.append("text")
		 .append("textPath")
		 .attr("text-anchor", "middle")
		 .attr("startOffset", "50%")
		 .style("overflow", "visible")
		 .attr("xlink:href", function (d, i) {
			 return "#" + scope.id + "_x_text_arc_" + i;
		 })
		 .text(function (d, i) {
		 	 return scope.xAxisTickFormat(d,i)
		 });
		
		xTicks.append("line")
		 .attr('x1',0)
		 .attr('x2',function (d,i) { return outerRadius * Math.cos(scope.xScale(d) - Math.PI/2)})
		 .attr('y1',0)
		 .attr('y2', function (d,i) { return outerRadius * Math.sin(scope.xScale(d) - Math.PI/2)})
		 .style('stroke', '#FFF')
		
		xTicks.append("text")
		 .attr('class','vz-spider-x-axis-label')
		 .attr('x',function (d,i) { return (outerRadius * scope.labelRadiusFactor) * Math.cos(scope.xScale(d) - Math.PI/2)})
		 .attr('y', function (d,i) { return (outerRadius * scope.labelRadiusFactor) * Math.sin(scope.xScale(d) - Math.PI/2)})
		 .text(function (d,i) { return scope.xAxisTickFormat(d); })
		 .attr('dy',function (d,i) { return (viz.getStyle('x-axis-font-size', arguments) * 1.2) + 'px'})
		 .style('font-size',function (d,i) { return viz.getStyle('x-axis-font-size', arguments) + 'px'})
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
				 return scope.yAxisTickFormat(tick);
			 })
		});
		
		// Let everyone know we are done updating.
		scope.dispatch.apply('update', viz);
		
	}
	
	// Used to translate from cartesian coordinates to polar coordinates.
	function cartesianToPolar(x, y) {
		var r = scope.radiusScale(x);
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
		//	 lineHeight = 1.4, // ems
			 y = text.attr("y"),
			 x = text.attr("x"),
			 dy = parseFloat(text.attr("dy")),
			 lineHeight = dy;
			 tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "px");
			
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "px").text(word);
				}
			}
			text.selectAll('tspan').attr("y",y - ((line.length > 1) ? 0 : (line.length * dy)))
		})
	};
	
	// This is our public update call that all viz components implement
	viz.update = function () {
		update();
		return viz;
	};
	
	
	/*****  STYLES *****/
	
	var styles_backgroundGradient;
	
	var stylesCallbacks = [
		{on: "update.styles", callback: applyStyles},
		{on: "mouseover.styles", callback: styles_onMouseOver},
		{on: "mouseout.styles", callback: styles_onMouseOut}
	];
	
	
	viz.applyCallbacks(stylesCallbacks);
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		// Grab the d3 selection from the viz so we can operate on it.
		var selection = scope.selection;
		
		styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-gradient-bottom'), viz.getStyle('background-gradient-top'));
		
		// Update the background
		selection.selectAll(".vz-background").style("fill", function () {
			return "url(#" + styles_backgroundGradient.attr("id") + ")";
		});
		
		// Hide the plot background
		selection.selectAll(".vz-plot-background").style("opacity", 0);
		
		// Update any of the area paths based on the skin settings
		selection.selectAll(".vz-area")
		 .style("fill", function (d, i) {
			 return viz.getStyle('area-fill', arguments);
		 })
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('area-fill-opacity', arguments)
		 });
		
		// Update any of the line paths based on the skin settings
		selection.selectAll(".vz-line")
		 .style("stroke-width", function () {
			 return outerRadius / 450
		 })
		 .style("stroke", function (d, i) {
			 return viz.getStyle('line-stroke', arguments)
		 })
		 .style("opacity", function (d, i) {
			 return viz.getStyle('line-opacity', arguments)
		 });
		
		// Hide all the data points
		selection.selectAll(".vz-data-point").style("opacity", 0);
		
		// Update the x axis ticks
		selection.selectAll(".vz-spider-x-axis-tick")
		 .style("font-weight", function (d, i) {
			 return viz.getStyle('x-axis-font-weight', arguments)
		 })
		 .style("fill", function (d, i) {
			 return viz.getStyle('label-color', arguments)
		 })
		 .style("fill-opacity", .7)
		 .style("font-size", Math.max(8, Math.round(outerRadius / 25)) + "px");
		
		// Update the y-axis ticks
		selection.selectAll(".vz-spider-x-axis-tick line")
		 .style("stroke", function (d, i) {
			 return viz.getStyle('x-axis-line-stroke', arguments)
		 })
		 .style("stroke-width", 1)
		 .style("opacity", function (d, i) {
			 return viz.getStyle('x-axis-line-opacity', arguments)
		 })
		
		
		// Update the y-axis ticks
		selection.selectAll(".vz-y-axis-tick")
		 .style("stroke", function (d, i) {
			 return viz.getStyle('y-axis-line-stroke', arguments)
		 })
		 .style("stroke-width", 1)
		 .style("opacity", function (d, i) {
			 return viz.getStyle('y-axis-line-opacity', arguments)
		 })
		
		// Update the y-axis tick labels
		selection.selectAll(".vz-y-axis-tick-label")
		 .style("font-size", Math.max(8, Math.round(outerRadius / 30)) + "px")
		 .style("fill", function (d, i) {
			 return viz.getStyle('label-color', arguments)
		 })
		 .style("font-weight", 200)
		 .style("fill-opacity", 0.5);
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	// This runs on every mouse over
	function styles_onMouseOver(e, d, i, j) {
		
		var selection = scope.selection;
		
		var datum = stackSeries[j][i];
		
		// Animate the changes to the line path
		selection.selectAll(".vz-line").transition('styles_mouseover')
		 .style("stroke-width", function () {
			 return outerRadius / 270
		 })
		 .style("stroke", function (d, i) {
			 return viz.getStyle('line-stroke-over', arguments)
		 })
		 .style("opacity", function (d, i) {
			 return (i == j) ? 1 : 0
		 });
		
		// Animate reduced opacity on area path
		selection.selectAll(".vz-area").transition('styles_mouseover')
		 .style("opacity", function (d, i) {
			 return (i == j) ? 1 : .2
		 });
		
		// Set the stroked dash highlight
		plot.append("circle").attr("class", "vz-y-axis-mouseover")
		 .attr("cx", 0)
		 .attr("cy", 0)
		 .attr("r", function () {
			 return scope.radiusScale(datum[1])
		 })
		 .style("stroke", viz.getStyle('y-axis-line-stroke'))
		 .style("fill", "none")
		 .style("stroke-dasharray", function () {
			 return outerRadius / 80 + "," + outerRadius / 80
		 });
		
		// Reduce the contrast on the y axis ticks
		selection.selectAll(".vz-y-axis-tick").style("opacity", .1)
		
		// Remove any previous point tips
		selection.selectAll(".vz-point-tip").remove();
		
		// Add a highlight circle
		d3.select(e).append("circle")
		 .attr("class", "vz-point-tip").attr("r", 4).style("fill", "#000").style("stroke", "#FFF").style("stroke-width", 2).style("pointer-events", "none");
		
		// Add the arc we need to show the page views
		defs.append("path")
		 .attr("class", "vz-tip-path")
		 .attr("id", function (d, i) {
			 return viz.id() + "_tip_path_arc_1";
		 })
		 .attr("d", function () {
			 return vizuly2.svg.text.textArcPath(scope.radiusScale(datum[1]) * 1.05, scope.xScale(scope.x(d)));
		 });
		
		// Show the hour
		plot.append("text")
		 .attr("class", "vz-label-tip")
		 .style("font-size",function (d,i) { return viz.getStyle('value-label-font-size',arguments)} + "px")
		 .style("text-transform", "uppercase")
		 .style("font-family", "Open Sans")
		 .style("fill-opacity", .75)
		 .style("fill", function (d, i) {
			 return viz.getStyle('label-color', arguments)
		 })
		 .style('text-anchor','middle')
		 .append("textPath")
		 .attr("startOffset", "50%")
		 .style("overflow", "visible")
		 .attr("xlink:href", function (d, i) {
			 return "#" + viz.id() + "_tip_path_arc_1";
		 })
		 .text(function () {
			 return scope.seriesLabel(d) + ' - ' + scope.yAxisTickFormat(scope.y(d));
		 });
		
		 xAxisPlot.selectAll('.vz-spider-x-axis-label').filter(function (d,index) { return index == i })
		  .transition()
		  .style('font-size',(viz.getStyle('x-axis-font-size') * 1.25) + 'px')
		  .style('font-weight', 'bold');
		
		xAxisPlot.selectAll('.vz-spider-x-axis-tick line').filter(function (d,index) { return index == i })
		 .style('opacity', 1)
	}
	
	// This runs on every mouse out
	function styles_onMouseOut(e, d, i, j) {
		
		var selection = scope.selection;
		
		// Animate the line paths back to original settings
		selection.selectAll(".vz-line").transition('styles_mouseover')
		 .style("stroke-width", function () {
			 return outerRadius / 450
		 })
		 .style("stroke", function (d, i) {
			 return viz.getStyle('line-stroke', arguments)
		 })
		 .style("opacity", function (d, i) {
			 return viz.getStyle('line-opacity', arguments)
		 })
		
		// Animate area opacity back to original
		selection.selectAll(".vz-area").transition('styles_mouseover')
		 .style("opacity", 1);
		
		// Remove dashed line highlight
		selection.selectAll(".vz-y-axis-mouseover").remove();
		
		// Remove the data tip
		selection.selectAll(".vz-point-tip").remove();
		selection.selectAll(".vz-label-tip").remove();
		selection.selectAll(".vz-tip-path").remove();
		
		// Put the y-axis ticks back to original opacity
		selection.selectAll(".vz-y-axis-tick")
		 .style("opacity", function (d, i) {
			 return viz.getStyle('y-axis-line-opacity', arguments)
		 })
		
		xAxisPlot.selectAll('.vz-spider-x-axis-label')
		 .transition()
		 .style('font-size',(viz.getStyle('x-axis-font-size')) + 'px')
		 .style('font-weight', 'normal');
		
		xAxisPlot.selectAll('.vz-spider-x-axis-tick line')
		 .style('opacity', viz.getStyle('x-axis-line-opacity'))
		
		
	}
	
	// Returns viz component :)
	return viz;
}