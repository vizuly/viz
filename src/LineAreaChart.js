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
// This is the base component for a vizuly2.line/area chart.
//
vizuly2.viz.LineAreaChart = function (parent) {
	
	// This is the object that provides pseudo "protected" properties that the vizuly2.viz function helps create
	var scope = {};
	
	// Get the d3 library set by vizuly
	var d3 = vizuly2.d3;
	
	var properties = {
		"data": null,                          // Expects array of data - assumes identical length and xScale values;
		"layout":                              // Sets a STACKED or OVERLAPlayout
		vizuly2.viz.layout.OVERLAP,
		"margin": {                            // Our margin object
			"top": "10%",                       // Top margin
			"bottom": "7%",                    // Bottom margin
			"left": "9%",                      // Left margin
			"right": "7%"                      // Right margin
		},
		"duration": 500,                       // This the time in ms used for any component generated transitions
		"width": 300,                          // Overall width of component
		"height": 300,                         // Height of component
		"x": null,                               // Function that returns xScale data value
		"y": null,                               // Function that returns yScale data value
		"seriesLabel": function (d) { return d.series; },
	  "xScale": "undefined",                 // xScale needs to be explicitly defined or we will define it later automatically
		"yScale": d3.scaleLinear(),           // Default yScale (can be overridden after 'validate' event via callback)
		"xAxis": d3.axisBottom(),                // Default xAxis (can be overridden after 'validate' event via callback)
		"yAxis": d3.axisLeft(),                // Default yAxis (can be overridden after 'validate' event via callback)
		"xTickFormat": function (d) {
			return d
		},
		"yTickFormat": function (d) {
			return d
		},
		"dataTipRenderer": dataTipRenderer,
		"curve": d3.curveLinear,                // interpolate determines how sharp or curved each line vertex is
		"useZoom": true
	};
	
	
	var styles = {
		'name': 'default',
		'label-color': '#FFF',
		'color': '#02C3FF',
		'background-gradient-top': '#021F51',
		'background-gradient-bottom': '#039FDB',
		'stroke-colors': ['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B'],
		'fill-colors': ['#C50A0A', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'],
		'line-stroke': function (d, i) {
			return viz.getStyle('stroke-colors', arguments)[i % 5];
		},
		'line-over-stroke': function (d, i) {
			return d3.color(viz.getStyle('stroke-colors', arguments)[i % 5]).brighter();
		},
		'line-opacity': function (d, i) {
			return (scope.layout === vizuly2.viz.layout.STREAM) ? .3 : .6;
		},
		'area-fill': function (d, i) {
			return 'url(#' + vizuly2.svg.gradient.fade(viz, viz.getStyle('fill-colors', arguments)[i % 5], 'vertical', [.35, 1]).attr('id') + ')';
		},
		'area-fill-opacity': function (d, i) {
			return (scope.layout === vizuly2.viz.layout.OVERLAP) ? .7 : .9;
		},
		'axis-font-weight': 400,
		'axis-stroke': '#FFF',
		'axis-opacity': .25,
		'axis-font-size': function () {
			return Math.max(8, Math.round(size.width / 65))
		},
		'data-point-stroke': function (d, i) {
			return viz.getStyle('stroke-colors', arguments)[i % 5];
		},
		'data-point-fill': function (d, i) {
			return '#FFF';
		}
	}
	
	
	//Create our viz and type it
	var viz = vizuly2.core.component(parent, scope, properties);
	viz.type = "vizuly2.viz.linearea";
	
	var size;       // Holds the 'size' variable as defined in viz.util.size()
	var tipRadius;  // each series data point has an invisible over it circle that captures mouse events - this is that radius
	var stack;      // used for the stacked layout options
	var stackSeries;
	
	// Our d3.svg path generators
	var line = d3.line(), area = d3.area();
	
	// These are all d3.selection objects we use to insert and update svg elements into
	var svg, g, bottomAxis, leftAxis, plot, background, plotBackground, series, defs, pointHitArea;
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		viz.defaultStyles(styles);
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.core.util.getDefs(viz);
		plotClipPath = defs.append("clipPath").attr("id", scope.id + "_plotClipPath").append("rect");
		xClipPath = defs.append("clipPath").attr("id", scope.id + "_xClipPath").append("rect");
		g = svg.append("g").attr("class", "vz-linearea-viz");
		bottomAxis = g.append("g").attr("clip-path", "url(#" + scope.id + "_xClipPath)").append("g").attr("class", "vz-bottom-axis");
		leftAxis = g.append("g").attr("class", "vz-left-axis");
		plot = g.append("g").attr("class", "vz-plot").attr("clip-path", "url(#" + scope.id + "_plotClipPath)");
		plotBackground = plot.append("rect").attr("class", "vz-plot-background");
		series = plot.append("g").attr("class", "vz-series");
		pointHitArea = g.append("g").attr("class", "vz-point-areas");
		
		scope.dispatch.apply('initialize', viz);
	}
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		// If we don't have a defined x-scale then determine one
		if (scope.xScale == "undefined") {
			scope.xScale = vizuly2.core.util.getTypedScale(viz.x()(scope.data[0][0]));
		}
		
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
		var offset = (scope.layout == vizuly2.viz.layout.STACKED) ? d3.stackOffsetNone : (scope.layout == vizuly2.viz.layout.STREAM) ? d3.stackOffsetWiggle : vizuly2.core.util.stackOffsetBaseline;
		var order = (scope.layout == vizuly2.viz.layout.STREAM) ? d3.stackOrderInsideOut : d3.stackOrderDescending;
		
		// The d3.stack handles all of the d.x and d.y measurements for various stack layouts - we will let it do its magic here
		stack = d3.stack()
		 .keys(stackKeys)
		 .order(order)
		 .offset(offset);
		
		// Apply the stack magic to our data - note this is a destructive operation and assumes certain properties can be mutated (x, x0, y, y0)
		stackSeries = stack(stackSeries);
		
		// Set our yScale domain values
		scope.yScale.domain([d3.min(stackSeries, stackMin), d3.max(stackSeries, stackMax)]);
		
		//See if scale is ordinal, else assume min and max is good enough
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
		
		scope.xScale.range([0, size.width]);
		
		// Set our scale ranges
		scope.yScale.range([size.height, 0]);
		//scope.xScale.range([0, size.width]);
		
		// Set our accessors so the d3.area can generate our area path data
		area.curve(scope.curve)
		 .x(function (d) {
			 return scope.xScale(d.data.x);
		 })
		 .y0(function (d) {
			 return scope.yScale(d[0]);
		 })
		 .y1(function (d) {
			 return scope.yScale(d[1]);
		 });
		
		// Set our accessors so the d3.line can generate our line path data
		line.curve(scope.curve)
		 .x(function (d) {
			 return scope.xScale(d.data.x);
		 })
		 .y(function (d, i) {
			 return scope.yScale(d[1]);
		 });
		
		// Set our axis for each scale - although this is something that could be handled in a theme.
		scope.xAxis.scale(scope.xScale);
		scope.yAxis.scale(scope.yScale);
		
		scope.xAxis.tickFormat(scope.xTickFormat).tickSize(-vizuly2.core.util.size(scope.margin, size.measuredWidth, size.measuredHeight).height);
		scope.yAxis.tickFormat(scope.yTickFormat).tickSize(-vizuly2.core.util.size(scope.margin, size.measuredWidth, size.measuredHeight).width).ticks(5);
		
		
		// Take an educated guess about how big to make our hit area radius based on height/width of viz.
		// This is what will pick up any mouse or touch events from the user for a given data point.
		tipRadius = Math.min(size.width / 50, size.height / 50);
		
		// Initialize our zoom operations (this is optional)
		initializeZoom();
		
		scope.dispatch.apply('measure', viz);
		//Can override all settings here;
		
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
		
		// Layout all of our primary SVG d3.elements.
		svg.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		background.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		plotClipPath.attr("width", size.width).attr("height", size.height);
		xClipPath.attr("width", size.width).attr("height", (size.height + size.bottom)).attr("transform", "translate(" + size.left + "," + size.top + ")");
		plot.style("width", size.width).style("height", size.height).attr("transform", "translate(" + size.left + "," + size.top + ")");
		pointHitArea.style("width", size.width).style("height", size.height).attr("transform", "translate(" + size.left + "," + size.top + ")");
		bottomAxis.attr("transform", "translate(" + size.left + "," + (size.height + size.top + 3) + ")");
		leftAxis.attr("transform", "translate(" + size.left + "," + size.top + ")");
		plotBackground.attr("width", size.width).attr("height", size.height);
		
		// Select, create, and destroy our series plots as needed
		// Each series is a group which contains its own set of plots
		
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
		
		seriesLine.transition()
		 .duration(scope.duration)
		 .attr("d", line)
		
		
		// Each time we are going to remove all point-tip areas (versus trying to use the select.enter/remove method
		pointHitArea.selectAll(".vz-tip").remove();
		
		// For EVERY data point across all series we are going to create a svg.g group and put a circle in it
		// The circle in it will have a very small (.001) opacity and be used to capture mouse events for
		// each data point
		// If you need to optimize this chart for performance you should consider removing these elements, it will
		// greatly speed up the rendering time and responsiveness of the chart
		stackSeries.forEach(function (series, j) {
			
			// Here are our svg.g elements
			var points = pointHitArea.selectAll("vz-tip").data(series).enter()
			 .append("g").attr("class", "vz-tip")
			 .attr("transform", function (d, i) {
				 return "translate(" + scope.xScale(d.data.x) + "," + scope.yScale(d[1]) + ")"
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
			
			// Here our our points for each one
			points.each(function () {
				var tip = d3.select(this);
				tip.append("circle")
				 .attr("class", "vz-hit-circle")
				 .style("fill", "#000")
				 .style("stroke", null)
				 .style("opacity", 0)
				 .transition()
				 .attr("r", tipRadius);
			});
		});
		
		
		// Update our axis
		bottomAxis.call(scope.xAxis);
		leftAxis.call(scope.yAxis);
		
		// Let everyone know we are done with our update.
		scope.dispatch.apply('update', viz);
		
	}
	
	// This is our public update call that all viz components implement
	viz.update = function () {
		update();
		return viz;
	};
	
	
	// These are our zoom functions that can be removed if you want by not calling the 'initializeZoom' function
	scope.zoom = null;
	
	viz.zoom = function (_) {
		if (!arguments.length) {
			return scope.zoom;
		}
		scope.zoom = _;
		onZoom();
	}
	
	// We need a clip path so when zoomed the relevant SVG elements don't overflow
	var plotClipPath, xClipPath;
	
	function initializeZoom() {
		
		// Create our zoom if we don't have one and set our callback to the zoom event
		if (!scope.zoom) {
			scope.zoom = d3.zoom()
			 //  .x(scope.xScale)
			 .scaleExtent([1, 10])
			 .on("start", onZoomStart)
			 .on("end", onZoomEnd)
			 .on("zoom", onZoom);
			
			plot.call(scope.zoom);
			
		}
		
		// initialize our zoom settings and set clip paths
		plotClipPath.attr("width", size.width).attr("height", size.height);
		xClipPath.attr("width", size.width).attr("height", (size.height + size.bottom)).attr("transform", "translate(" + size.left + "," + size.top + ")");
	}
	
	
	/* Needed to support touch events */
	var hit_circle = null;
	
	// This is where all the zoom magic happens.   There are several ways you can implement d3.behavior.zoom (https://github.com/mbostock/d3.wiki/Zoom-Behavior)
	// d3.does a lot of 'magic' behind the scenes with the scales and the axis, so you need to be careful
	function onZoom() {
		
		//We don't want touch events on the hit circles to trigger a zoom event so we escape them here;
		if (hit_circle || !scope.useZoom) {
			//This means a touch event triggered this.
			return;
		}
		
		// See if we have zoomed out of bounds, if so constrain the panning
		var t = d3.event.transform;
		tx = t.x, ty = t.y;
		
		tx = Math.min(tx, 0);
		tx = Math.max(tx, size.width - size.width * t.k);
		
		t = d3.zoomIdentity.translate(tx, ty).scale(t.k);
		
		scope.zoom.on('zoom', null);
		plot.call(scope.zoom.transform, t);
		scope.zoom.on('zoom', onZoom);
		
		var rescaleX = t.rescaleX(scope.xScale);
		
		bottomAxis.call(scope.xAxis.scale(rescaleX));
		
		area.x(function (d) {
			return rescaleX(d.data.x);
		})
		
		line.x(function (d) {
			return rescaleX(d.data.x);
		})
		
		// Update our paths based on the zoom scale and translate
		
		plot.selectAll(".vz-line").attr("d", line);
		plot.selectAll(".vz-area").attr("d", area);
		
		area.x(function (d) {
			return scope.scaleX(d.data.x);
		})
		line.x(function (d) {
			return scope.scaleX(d.data.x);
		})
		
		// Update all of our data tip plot points
		pointHitArea.selectAll(".vz-tip")
		 .attr('transform', function (d) {
			 //console.log(d.data.x)
			 return "translate(" + rescaleX(d.data.x) + "," + scope.yScale(d[1]) + ")"
		 })
		
		applyAxisStyles();
		
		scope.dispatch.apply('zoom', viz);
		
	}
	
	
	// We need to capture the zoom start event so we can handle interactions with the
	// hit_circle so they don't interfere with the zoom operation.
	// We do this by hiding the hit-circles from the DOM display when the zoom starts and adding them back at the zoom end
	// This prevents the user from accidentally interacting with them
	function onZoomStart() {
		
		if (!scope.useZoom) return;
		
		var t = d3.event.sourceEvent.target;
		
		//Get our hit circle if we have one and set the flag
		if (d3.select(t).attr("class") == "vz-hit-circle") {
			hit_circle = t;
		} else {
			hit_circle = null;
			// Hide our hit circle
			pointHitArea.style("display", "none");
		}
		
		// Adjust our clip paths
		plotClipPath.attr("width", size.width);
		xClipPath.attr("width", size.width).attr("height", (size.height + size.bottom)).attr("transform", "translate(" + size.left + "," + size.top + ")");
		
		//Emit our zoom start event;
		scope.dispatch.apply('zoomstart', viz);
	}
	
	// At zoom end we add the hit-circles back to the DOM display
	function onZoomEnd() {
		
		if (!scope.useZoom) return;
		
		//Update our tips and add hit-circle back to the display
		pointHitArea.style("display", "block");
		
		//Clear the flag
		hit_circle = null;
		
		bottomAxis.call(scope.xAxis);
		
		//Emit our zoomend event.
		scope.dispatch.apply('zoomend', viz);
	}

	var styles_businessColors = d3.scaleOrdinal(d3.schemeCategory20);
	var styles_backgroundGradient;
	
	// styles and styles
	var stylesCallbacks = [
		{on: 'update.styles', callback: applyStyles},
		{on: 'mouseover.styles', callback: styles_onMouseOver},
		{on: 'mouseout.styles', callback: styles_onMouseOut}
	];
	
	viz.applyCallbacks(stylesCallbacks);
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		// The width and height of the viz
		var w = size.measuredWidth;
		var h = size.measuredHeight;
		
		// Grab the d3.selection from the viz so we can operate on it.
		var selection = scope.selection;
		
		styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-gradient-bottom'), viz.getStyle('background-gradient-top'));
		
		// Update the background
		selection.selectAll(".vz-background").style("fill", function () {
			return "url(#" + styles_backgroundGradient.attr("id") + ")";
		});
		
		// Hide the plot background
		selection.selectAll(".vz-plot-background").style("opacity", 0);
		
		// Style the area paths
		selection.selectAll(".vz-area")
		 .style("fill", function (d, i) {
			 return viz.getStyle('area-fill', arguments);
		 })
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('area-fill-opacity', arguments);
		 });
		
		// Style the line paths
		selection.selectAll(".vz-line")
		 .style("stroke-width", function () {
			 return h / 450
		 })
		 .style("stroke", function (d, i) {
			 return viz.getStyle('line-stroke', arguments);
		 })
		 .style("opacity", function (d, i) {
			 return viz.getStyle('line-opacity', arguments);
		 });
		
		// Hide all data points
		selection.selectAll(".vz-data-point").style("opacity", 0);
		
		// Update the left axis text (dynamically adjust font size)
		selection.selectAll(".vz-left-axis text")
		 .style("font-size", Math.max(8, Math.round(w / 65)) + "px")
		 .style("fill", function () {
			 return viz.getStyle('label-color')
		 })
		 .style("fill-opacity", .8);
		
		applyAxisStyles();
		
		scope.dispatch.apply('styled', viz);
	}
	
	function applyAxisStyles() {
		var selection = scope.selection;
		
		// Update the bottom axis (dynamically adjust font size)
		selection.selectAll(".vz-bottom-axis text, .vz-left-axis text")
		 .style("font-weight", function () {
			 return viz.getStyle('axis-font-weight', arguments)
		 })
		 .style("fill", function () {
			 return viz.getStyle('label-color')
		 })
		 .style("fill-opacity", .8)
		 .style("font-size", function (d,i) { return viz.getStyle('axis-font-size',arguments)  + "px"})
		 .style("opacity", function () {
			 return size.measuredWidth > 399 ? 1 : 0
		 })
		
		// Update the left axis
		selection.selectAll(".vz-left-axis line, .vz-bottom-axis line")
		 .attr('stroke',null)
		 .style("stroke", function () {
			 return viz.getStyle('axis-stroke')
		 })
		 .style("stroke-width", 1)
		 .style("opacity", function () {
			 return viz.getStyle('axis-opacity')
		 })
		
		selection.selectAll(".vz-left-axis").attr("font-family", null)
		selection.selectAll(".vz-bottom-axis").attr("font-family", null)
		selection.selectAll('.vz-left-axis path.domain').style('display', 'none');
		selection.selectAll('.vz-bottom-axis path.domain').style('display', 'none');
		selection.selectAll('.vz-bottom-axis line').style('display', 'none');
	}
	
	// Fires on each mouse over
	function styles_onMouseOver(e, d, i, j) {
		
		// Animate the line to be less bright unless it is the selected one
		scope.selection.selectAll(".vz-line").transition()
		 .style("stroke", function (d, i) {
			 return viz.getStyle('line-over-stroke', arguments);
		 })
		 .style("opacity", function (d, i) {
			 return (i === j) ? 1 : 0
		 });
		
		// Anmiate the area paths to be less bright unless it is the selcted one
		scope.selection.selectAll(".vz-area").transition()
		 .style("opacity", function (d, i) {
			 return (i === j) ? 1 : .35
		 });
		
		// Remove any data tips
		scope.selection.selectAll(".vz-point-tip").remove();
		
		// Create a data tip circle for the appropriate data point.
		var g = d3.select(e);
		g.append("circle")
		 .attr("class", "vz-point-tip").attr("r", 4).style("fill", "#000").style("stroke", "#FFF").style("stroke-width", 2).style("pointer-events", "none");
		
		viz.showDataTip(e, d, i)
	}
	
	// Fires on each mouse out
	function styles_onMouseOut(e, d, i, j) {
		
		// Put all the lines back to original styling.
		scope.selection.selectAll(".vz-line").transition()
		 .style("stroke", function (d, i) {
			 return viz.getStyle('line-stroke', arguments);
		 })
		 .style("opacity", function (d, i) {
			 return viz.getStyle("line-opacity", arguments);
		 });
		
		// Put all areas back to full opacity
		scope.selection.selectAll(".vz-area").transition()
		 .style("opacity", 1);
		
		// Remove any data tip circles
		scope.selection.selectAll(".vz-point-tip").remove();
		
		viz.removeDataTip();
	}
	
	function dataTipRenderer(tip, e, d, i, x, y) {
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header3" style="font-size:12px;"> HEADER3 </div>';
		
		var h1 = scope.xTickFormat(scope.x(d));
		var h2 = scope.yTickFormat(scope.y(d));
		var h3 = scope.seriesLabel(d);
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		html = html.replace("HEADER3", h3);
		
		tip.style('height','80px').html(html);
		
		console.log((Number(x) + Number(d3.select(e).attr('width'))));
		
		return [x-70, y - 110]
		
	}
	
	initialize();
	
	// Returns our glorious viz component :)
	return viz;
	
};