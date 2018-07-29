/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 This source code is covered under the following license: http://vizuly2.io/commercial-license/
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.45

//
// This is the base component for a vizuly2.scatter
//
vizuly2.viz.ScatterPlot = function (parent) {
	
	// This is the object that provides pseudo "protected" properties that the vizuly2.viz function helps create
	var scope = {};
	
	var d3 = vizuly2.d3;
	
	var properties = {
		'data': null,                            // Expects array of single series of data;
		'margin': {                              // Our margin object
			'top': '10%',                          // Top margin
			'bottom': '7%',                        // Bottom margin
			'left': '9%',                          // Left margin
			'right': '7%'                          // Right margin
		},
		'duration': 500,                         // This the time in ms used for any component generated transitions
		'width': 300,                            // Overall width of component
		'height': 300,                           // Height of component
		'x': null,                               // Function that returns xScale data value
		'y': null,                               // Function that returns yScale data value
		'r': null,                               // Function that returns rScale data value
		'xScale': 'undefined',                   // Default xScale (can be overridden after 'validate' event via callback)
		'yScale': 'undefined',                   // Default yScale (can be overridden after 'validate' event via callback)
		'rScale': 'undefined',                   // Default rScale - radius (can be overridden after 'validate' event via callback)
		'xAxis': d3.axisBottom(),                // Default xAxis (can be overridden after 'validate' event via callback)
		'yAxis': d3.axisLeft(),                  // Default xAxis (can be overridden after 'validate' event via callback)
		'xTickFormat': function (d) {
			return d
		},
		'yTickFormat': function (d) {
			return d
		},
		'dataTipRenderer': dataTipRenderer
	};
	
	var styles = {
		'fill-top': '#777',
		'fill-bottom': '#CCC',
		'label-color': '#FFF',
		'axis-stroke': '#FFF',
		'axis-opacity': 0.25,
		'axis-font-size': function (d, i) {
			return Math.max(8, Math.round(size.width / 65))
		},
		'node-stroke': function (d, i) {
			return '#777';
		},
		'node-stroke-width': 1,
		'node-fill': function (d, i) {
			return '#FFF';
		},
		'node-fill-opacity': function (d, i) {
			return .7;
		},
		'node-stroke-opacity': .25,
		'node-over-stroke': '#000',
		'node-over-stroke-width': 2,
		'node-over-stroke-opacity': .8,
		'node-over-fill': function (d, i) {
			return '#FFF';
		},
		'node-over-fill-opacity': function (d, i) {
			return .9;
		}
	};
	
	//Create our viz and type it
	var viz = vizuly2.core.component(parent, scope, properties);
	
	//Measurements
	var size;           // Holds the 'size' variable as defined in viz.util.size()
	var plotMaxRadius;  // Holds the maximium radius for all plots
	
	//These are all d3.selection objects we use to insert and update svg elements into
	var svg, g, bottomAxis, leftAxis, plot, plots, background, plotBackground, defs;
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the individual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		viz.defaultStyles(styles);
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.core.util.getDefs(viz);
		g = svg.append("g").attr("class", "vz-scatter-viz");
		bottomAxis = g.append("g").attr("class", "vz-bottom-axis").attr("clip-path", "url(#" + scope.id + "_xClipPath)").append("g");
		leftAxis = g.append("g").attr("class", "vz-left-axis");
		plot = g.append("g").attr("class", "vz-scatter-plot").attr("clip-path", "url(#" + scope.id + "_plotClipPath)");
		plotBackground = plot.append("rect").attr("class", "vz-plot-background").style("fill", "#FFF").style("fill-opacity", .01);
		
		// Tell everyone we are done initializing
		scope.dispatch.apply('initialize', viz);
		
	}
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height);
		
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
		scope.xAxis.scale(scope.xScale).tickFormat(scope.xTickFormat)
		scope.yAxis.scale(scope.yScale).tickFormat(scope.yTickFormat).tickSize(-vizuly2.core.util.size(scope.margin, scope.width, scope.height).width).ticks(5)
		
		// Tell everyone we are done making our measurements
		scope.dispatch.apply('measure', viz);
		
	}
	
	// The update function is the primary function that is called when we want to render the visualiation based on
	// all of its set properties.  A developer can change properties of the components and it will not show on the screen
	// until the update function is called
	function update() {
		
		// Call measure each time before we update to make sure all our our layout properties are set correctly
		measure();
		
		// Layout all of our primary SVG d3.elements.
		svg.attr("width", scope.width).attr("height", scope.height);
		background.attr("width", scope.width).attr("height", scope.height);
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
		scope.dispatch.apply('update', viz);
		
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
		{on: 'update.styles', callback: applyStyles},
		{on: 'mouseover.styles', callback: styles_onMouseOver},
		{on: 'mouseout.styles', callback: styles_onMouseOut}
	];
	
	viz.applyCallbacks(stylesCallbacks);
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		var selection = scope.selection;
		
		// Update the background
		styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('fill-bottom'), viz.getStyle('fill-top'));
		
		// Update the background
		selection.selectAll(".vz-background").attr("fill", function () {
			return "url(#" + styles_backgroundGradient.attr("id") + ")";
		});
		
		// Update the bottom axis
		selection.selectAll(".vz-bottom-axis text, .vz-left-axis text")
		 .style("font-weight", viz.getStyle('axis-font-weight'))
		 .style("fill", viz.getStyle('label-color'))
		 .style("font-size", viz.getStyle('axis-font-size') + "px")
		
		// Update the left axis
		selection.selectAll(".vz-bottom-axis line, .vz-left-axis line")
		 .style("stroke", viz.getStyle('axis-stroke'))
		 .style("stroke-width", 1)
		 .style("opacity", viz.getStyle('axis-opacity'));
		
		
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
		
		selection.selectAll('.vz-left-axis path.domain').style('display', 'none');
		selection.selectAll('.vz-bottom-axis path.domain').style('display', 'none');
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function styles_onMouseOver(node, d, i) {
		
		
		d3.select(node)
		 .style("stroke", function (d, i) {
			 return viz.getStyle('node-over-stroke', arguments)
		 })
		 .style("stroke-width", function (d, i) {
			 return viz.getStyle('node-over-stroke-width', arguments)
		 })
		 .style("stroke-opacity", function (d, i) {
			 return viz.getStyle('node-over-stroke-opacity', arguments)
		 })
		 .style("fill", function (d, i) {
			 return viz.getStyle('node-over-fill', arguments)
		 })
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('node-over-fill-opacity', arguments)
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
	
	initialize();
	
	return viz;
	
};