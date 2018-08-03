/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 This source code is covered under the following license: http://vizuly.io/commercial-license/
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.45

//
// This is the base component for a vizuly column chart.
//
vizuly2.viz.ColumnChart = function (parent) {
	
	// This is the object that provides pseudo "protected" properties that the vizuly.viz function helps create
	var scope = {};
	
	var d3 = vizuly2.d3;
	
	var properties = {
		"data": null,                          // Expects array of series data - assumes each series has same length and sames xScale values;
		"layout":                              // Sets a CLUSTERED OR STACKED layout
		vizuly2.viz.layout.CLUSTERED,
		"margin": {                             // Our margin object
			"top": "7%",                       // Top margin
			"bottom": "10%",                     // Bottom margin
			"left": "9%",                       // Left margin
			"right": "7%"                       // Right margin
		},
		/**
		 * The time (in milliseconds) for any transition animations
		 * @type {Number}
		 * @example
		 * viz.duration(1000);
		 */
		"duration": 500,                        // This the time in ms used for any component generated transitions
		"width": 300,                           // Overall width of component
		"height": 300,                          // Height of component
		"barWidth": -1,                          // -1 means dynamic width, positive values are fixed width and will override chart width if needed.
		"barPadding": '20%',                    // % space between bars OR fixed space between bars.
		"groupPadding": '30%',                  // % space between bars OR fixed space between bars.
		"x": null,                              // Function that returns xScale data value
		"y": null,                              // Function that returns yScale data value
		"seriesLabel" : function (d) { return d.series },
		"xScale": "undefined",           // Default xScale (can be overridden after 'validate' event via callback)
		"yScale": d3.scaleLinear(),            // Default yScale (can be overridden after 'validate' event via callback)
		"xAxis": d3.axisBottom(),                 // Default xAxis (can be overridden after 'validate' event via callback)
		"yAxis": d3.axisLeft(),                  // Default yAxis (can be overridden after 'validate' event via callback)
		"yTickFormat": function (d) { return d },
		"xTickFormat": function (d) { return d },
		"dataTipRenderer": dataTipRenderer,
		"labelFormat": function (d) { return d }
	};
	
	var styles = {
		'label-color': '#FFF',
		'label-over-color': '#02C3FF',
		'label-font-size': function () {
			return Math.max(8, Math.round(size.width /85))
		},
		'label-font-weight': 400,
		'show-value-labels': true,
		'background-gradient-bottom': '#039FDB',
		'background-gradient-top': '#021F51',
		'bar-stroke': '#FFF',
		'bar-stroke-width': function (d,i) {
			return (this.width() / 800) + "px";
		},
		'bar-stroke-opacity': function (d, i) {
			return (scope.layout == vizuly2.viz.layout.STACKED) ? '1' : '0'
		},
		'bar-over-stroke': '#FFF',
		'bar-fill': '#02C3FF',
		'bar-fill-opacity': function (d, i) {
			return (1 - ((i) / (scope.data.length + 1)));
		},
		'bar-over-fill': '#FFF',
		'bar-over-fill-opacity': 1,
		'bar-radius': 0,
		'axis-font-weight': 400,
		'axis-font-size': function () {
			return Math.max(8, Math.round(size.width / 65))
		},
		'show-y-axis-labels': true,
		'show-x-axis-labels': true,
		'y-axis-font-style': 'normal',
		'x-axis-font-style': 'normal',
		'axis-stroke': '#FFF',
		'axis-opacity': .5
	}
	
	//Create our viz and type it
	var viz = vizuly2.core.component(parent, scope, properties);
	
	// Measurements
	
	var size;           // Holds the 'size' variable as defined in viz.util.size()
	var barWidth;       // measured bar width
	var groupWidth;     // measured bar group width
	var barPadding;
	var groupPadding;
	var seriesOffset = 0; //Used for scaleoffset
	var stack;          // used for the stacked bar layout
	var stackSeries;
	var axisFontSize;
	
	//These are all d3.selection objects we use to insert and update svg elements into
	var svg, g, bottomAxis, leftAxis, plot, barGroup, background, plotBackground, defs;

	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the individual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as D3 selections.
	function initialize() {
		
		viz.defaultStyles(styles);
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		defs = vizuly2.core.util.getDefs(viz);
		background = svg.append("rect").attr("class", "vz-background");
		g = svg.append("g").attr("class", "vz-column-viz");
		bottomAxis = g.append("g").attr("class", "vz-bottom-axis");
		leftAxis = g.append("g").attr("class", "vz-left-axis");
		plot = g.append("g").attr("class", "vz-plot");
		plotBackground = plot.append("rect").attr("class", "vz-plot-background").style("fill", "#FFF").style("fill-opacity", .01);
		
		// Tell everyone we are done initializing
		scope.dispatch.apply('initialize', viz);
	}
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		//If we have fixed bar width then we will override the height of the component
		if (scope.barWidth > 0) {
			barWidth = scope.barWidth;
			barPadding = calculatePadding(scope.barPadding, barWidth);
			groupWidth = (scope.layout == vizuly2.viz.layout.STACKED) ? (barWidth + barPadding) : (barWidth + barPadding) * scope.data.length;
			groupPadding = calculatePadding(scope.groupPadding, groupWidth);
			size.width = (groupWidth + groupPadding) * scope.data[0].length;
			size.left = (size.measuredWidth - size.width)/2;
			size.right = size.left;
		}
		else {
			// The width of each group of bars for a given data point and all of series
			groupWidth = (size.width / scope.data[0].length);
			groupPadding = calculatePadding(scope.groupPadding, groupWidth);
			groupWidth = groupWidth - groupPadding;
			// The width of an individual bar for a given data point a single series
			barWidth = (scope.layout == vizuly2.viz.layout.STACKED) ? groupWidth : (groupWidth / scope.data.length);
			barPadding = calculatePadding((scope.layout == vizuly2.viz.layout.STACKED)  ? 0 : scope.barPadding, barWidth);
			if (barPadding > barWidth) barPadding = barWidth-2;
			barWidth = barWidth - barPadding;
		}
		
		
		// If we don't have a defined x-scale then determine one
		if (scope.xScale == "undefined") {
			scope.xScale = vizuly2.core.util.getTypedScale(viz.x()(scope.data[0][0]));
		}
		
		// Set our domains for the yScale (categories)
		// Assumes ordinal scale if we have a string, otherwise min and max will do;
		if (typeof scope.x(scope.data[0][0]) == "string") {
			scope.xScale.domain(scope.data[0].map(function (d) {
				return scope.x(d);
			}));
		}
		else {
			scope.xScale.domain([
				d3.min(scope.data[0],
				 function (d) {
					 return scope.x(d);
				 }),
				d3.max(scope.data[0], function (d) {
					return scope.x(d);
				})
			]);
		}
		
		// This assumes all series share the same key value for the x-axis and are ordered accordingly.
		stackSeries = [];
		var stackKeys = [];
		
		scope.data.forEach(function (series, i) {
			stackKeys.push("series" + i);
		})
		
		for (var columnIndex = 0; columnIndex < scope.data[0].length; columnIndex++) {
			var row = {};
			scope.data.forEach(function (series, i) {
				row['series' + i] = {}
				row['series' + i].data = series[columnIndex];
			})
			stackSeries.push(row);
		}
		
		var offset = (scope.layout == vizuly2.viz.layout.STACKED) ? d3.stackOffsetNone : vizuly2.core.util.stackOffsetBaseline;
		
		// The d3.stack handles all of the d.x and d.y measurements for various stack layouts - we will let it do its magic here
		stack = d3.stack()
		 .value(function (d, i) {
			 var datum = d[i].data;
			 return scope.y(datum);
		 })
		 .keys(stackKeys)
		 .offset(offset)
		 .order(d3.stackOrderAscending);
		
		// Apply the stack magic to our data - note this is a destructive operation and assumes certain properties can be mutated (x, x0, y, y0)
		stackSeries = stack(stackSeries);
		
		// We set our xScale domain based on whether we have a stacked or clustered layout
		scope.yScale.domain([0, d3.max(stackSeries, function (series) {
			return d3.max(series, function (d) {
				return d[1];
			})
		})]);
		
		// Set our ranges for each scale
		scope.yScale.range([size.height, 0]);
		
		seriesOffset = 0;
		
		var xScaleOffset = 0;
		
		if (typeof scope.xScale.clamp != 'undefined') {
			seriesOffset = (groupWidth + groupPadding)/2;
			xScaleOffset = groupWidth;
		}
		
		scope.xScale.range([0, size.width - xScaleOffset]);
		
		scope.xAxis.scale(scope.xScale);
		scope.yAxis.scale(scope.yScale);
		
		scope.xAxis.tickFormat(scope.xTickFormat).tickSize(-size.height);
		scope.yAxis.tickFormat(scope.yTickFormat).tickSize(-size.width).ticks(5);
		
		// Tell everyone we are done making our measurements
		scope.dispatch.apply('measure', viz);
	}
	
	function calculatePadding(padding, w) {
		var val = 0;
		if(typeof padding == "string" && padding.substr(padding.length-1) == "%") {
			var r = Math.min(Number(padding.substr(0,padding.length-1)),100)/100;
			val = Math.round(w * r);
		}
		else if (!isNaN(Number(padding))) {
			val = Number(padding);
		}
		else {
			val = 10;
		}
		return val;
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
		plot.style("width", size.width).style("height", size.height).attr("transform", "translate(" + (size.left) + "," + (size.top) + ")");
		bottomAxis.attr("transform", "translate(" + (size.left + seriesOffset) + "," + (size.measuredHeight - (size.measuredHeight - size.height)/2) + ")");
		leftAxis.attr("transform", "translate(" + size.left + "," + size.top + ")");
		plotBackground.attr("width", size.width).attr("height", size.height);
		
		// Select, create, and destroy our bar groups as needed
		barGroup = plot.selectAll(".vz-bar-group").data(stackSeries[0]);
		barGroup = barGroup.enter().append("g").attr("class", "vz-bar-group").merge(barGroup);
		barGroup.exit().remove();
		
		// Create bars in each group - even if there is only one
		barGroup.each(function (datum, index) {
			
			var group = d3.select(this);
			
			var bars = group.selectAll(".vz-bar").data(stackSeries.map(function (series, i) {
				return series[index];
			}));
			
			bars.exit().remove();
			
			bars = bars.enter().append("rect").attr("class", "vz-bar")
			 .attr("x", function (d, i) {
				 return i * (barWidth + barPadding);
			 })
			 .attr("height", 0).attr("y", size.height)
			 .on("mouseover", function (d, i) {
				 scope.dispatch.apply('mouseover', viz, [this, d.data['series' + i].data, i, index])
			 })
			 .on("mouseout", function (d, i) {
				 scope.dispatch.apply('mouseout', viz, [this, d.data['series' + i].data, i, index]);
			 })
			 .on("click", function (d, i) {
				 scope.dispatch.apply('click', viz, [this, d.data['series' + i].data, i, index])
			 })
			 .on("touch", function (d, i) {
				 scope.dispatch.apply('touch', viz, [this, d.data['series' + i].data, i, index])
			 })
			 .merge(bars);
			
			bars.attr("width", barWidth).attr("height",0).attr("y", size.height);
			
			bars.transition().duration(scope.duration)
			 .attr("x", function (d, i) {
				 return (scope.layout == vizuly2.viz.layout.STACKED) ?  0 :  i * (barWidth + barPadding);
			 })
			 .attr("width", barWidth)
			 .attr("height", function (d, i) {
				 return (scope.layout == vizuly2.viz.layout.STACKED) ? scope.yScale(d[0]) - scope.yScale(d[1]) : size.height - scope.yScale(d[1])
			 })
			 .attr("y", function (d, i) {
				 return scope.yScale(d[1]);
			 });
			
			var labels = d3.select(this).selectAll(".vz-bar-label").data(stackSeries.map(function (series, i) {
				return series[index];
			}));
			
			labels.exit().remove();
			
			labels = labels.enter().append("text").attr("class", "vz-bar-label")
			 .attr("x", function (d, i) {
				 return i * (barWidth + barPadding);
			 })
			 .attr("y", size.height)
			 .text(function (d,i) { return scope.labelFormat(scope.y(d.data['series' + i].data)) })
			 .merge(labels);
			
			labels.attr("x",0);
			
			labels.transition().duration(scope.duration)
			 .attr("x", function (d, i) {
				 var datum = d.data['series' + i].data;
				 var fs = viz.getStyle('label-font-size',[datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this]);
				 return (scope.layout == vizuly2.viz.layout.STACKED) ?  fs/2 + barWidth:  i * (barWidth + barPadding) + (barWidth/2);
			 })
			 .attr("y", function (d, i) {
				 var datum = d.data['series' + i].data;
				 var fs = viz.getStyle('label-font-size',[datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this]);
				 return (scope.layout == vizuly2.viz.layout.STACKED) ? scope.yScale(d[1] - fs/2) : scope.yScale(d[1]) - fs/2;
			 })
			
			group.attr("transform", function (d, i) {
				return "translate(" + (scope.xScale(scope.x(datum.data['series0'].data)) + (groupPadding + barPadding)/2) +  ",0)"
			});
			
			
		});
		
		
		// Update our axis labels
		bottomAxis.call(scope.xAxis);
		leftAxis.call(scope.yAxis);
		
		// Let everyone know we are doing doing our update
		// Typically themes will attach a callback to this event so they can apply styles to the elements
		scope.dispatch.apply('update', viz);
		
	}
	
	// This is our public update call that all viz components implement
	viz.update = function () {
		update();
		return viz;
	};
	
	var styles_businessColors = d3.scaleOrdinal(d3.schemeCategory20);
	var styles_backgroundGradient;
	
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
		
		
		//Here we select all the bars and apply filters and fills.  In the case of these styless
		//we are using **svg drop-shadow filters** and **linear gradients** for the fills.
		selection.selectAll(".vz-bar-group").each(
		 function (datum, index) {
			 d3.select(this).selectAll("rect.vz-bar")
				.style("fill", function (d, i) {
					var datum = d.data['series' + i].data;
					return viz.getStyle('bar-fill', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
				})
				.style("fill-opacity", function (d, i) {
					var datum = d.data['series' + i].data;
					return viz.getStyle('bar-fill-opacity', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
				})
				.style("stroke", function (d, i) {
					var datum = d.data['series' + i].data;
					return viz.getStyle('bar-stroke', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
				})
				.style("stroke-opacity", function (d, i) {
					var datum = d.data['series' + i].data;
					return viz.getStyle('bar-stroke-opacity', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
				})
			  .style("stroke-width", function (d, i) {
				  var datum = d.data['series' + i].data;
				  return viz.getStyle('bar-stroke-width', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
			  })
				.style("rx", function (d, i) {
					var datum = d.data['series' + i].data;
					return viz.getStyle('bar-radius', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
				});
			
			 // Update value labels
			 d3.select(this).selectAll(".vz-bar-label")
			  .style('display', function (d,i) {
				  console.log("i = " + i)
				  var datum = d.data['series' + i].data;
				  return viz.getStyle('show-value-labels', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this]) ? 'block' : 'none'
			  })
			  .style('text-anchor', (scope.layout == vizuly2.viz.layout.STACKED) ? 'start' : 'middle')
			  .style("font-weight", function (d,i) {
				  var datum = d.data['series' + i].data;
				  return viz.getStyle('label-font-weight', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
			  })
			  .style("fill", function (d,i) {
				  var datum = d.data['series' + i].data;
				  return viz.getStyle('label-color', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
			  })
			  .style("font-size", function (d,i) {
				  var datum = d.data['series' + i].data;
				  return viz.getStyle('label-font-size', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this]) + "px"
			  });
		 });
		
		// Update axis fonts
		selection.selectAll(".vz-bottom-axis text, .vz-left-axis text")
		 .style("font-weight", function () {
			 return viz.getStyle('axis-font-weight', arguments)
		 })
		 .style("fill", function () {
			 return viz.getStyle('label-color')
		 })
		 .style("fill-opacity", .8)
		 .style("font-size", function (d,i) { return viz.getStyle('axis-font-size', arguments) + "px" })
		 .attr("dy", function (d,i) { return viz.getStyle('axis-font-size', arguments)/2 });
		
		selection.selectAll(".vz-bottom-axis text")
		 .style('display', function () { return viz.getStyle('show-x-axis-labels', arguments) ? 'block' : 'none' })
		 .style('font-style', function () { return viz.getStyle('x-axis-font-style', arguments) })
		 .style("text-anchor", "middle")
		
		selection.selectAll(".vz-left-axis text")
		 .style('display', function () { return viz.getStyle('show-y-axis-labels', arguments) ? 'block' : 'none' })
		 .style('font-style', function () { return viz.getStyle('y-axis-font-style', arguments) })
		
		// Update the left axis
		selection.selectAll(".vz-bottom-axis line, .vz-left-axis line")
		 .attr('stroke', null)
		 .attr('fill', null)
		 .style("stroke", function () {
			 return viz.getStyle('axis-stroke')
		 })
		 .style("stroke-width", 1)
		 .style("opacity", function () {
			 return viz.getStyle('axis-opacity')
		 })
		 .style("font-size", function () {
			 return viz.getStyle('axis-font-size') + "px"
		 })
		 .style("fill", function () {
			 return viz.getStyle('label-color')
		 })
		 .style("fill-opacity", .8)
		
		
		selection.selectAll(".vz-left-axis").attr("font-family", null)
		selection.selectAll(".vz-bottom-axis").attr("font-family", null)
		selection.selectAll('.vz-bottom-axis path.domain').style('display', 'none');
		selection.selectAll('.vz-left-axis path.domain').style('display', 'none');
		selection.selectAll('.vz-bottom-axis line').style('display', 'none');
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function styles_onMouseOver(bar, d, i) {
		
		var groupIndex = scope.yScale.domain().indexOf(scope.y(d))
		
		//Making style and color changes to our bar for the <code>mouseover</code>.
		d3.select(bar)
		 .style("fill", function (d, i) {
			 return viz.getStyle('bar-over-fill', arguments)
		 })
		 .style("fill-opacity", function (d, i) {
			 return viz.getStyle('bar-over-fill-opacity', arguments)
		 })
		 .style("stroke", function (d, i) {
			 return viz.getStyle('bar-over-stroke', arguments)
		 })
		 .attr("filter", function (d, i) {
			 return viz.getStyle('bar-over-filter', arguments)
		 })
		
		//Finding the correct axis label and highlighting it.
		d3.select(leftAxis
		 .selectAll('.tick text').nodes()[groupIndex])
		 .transition()
		 .style("font-size", function () {
			 return viz.getStyle('axis-font-size') * 1.2 + "px"
		 })
		 .style("font-weight", 700)
		 .style("fill", function (d, i) {
			 return viz.getStyle('label-over-color', arguments)
		 })
		 .style("text-decoration", "underline")
		 .style("fill-opacity", 1)
		 .style("opacity", 1);
		
		 viz.showDataTip(bar, d, i);
	}
	
	//On <coce>mouseout</code> we want to undo any changes we made on the <code>mouseover</code>.
	function styles_onMouseOut(bar, d, i) {
		
		viz.removeDataTip();
		
		var groupIndex = scope.yScale.domain().indexOf(scope.y(d))
		
		d3.select(bar)
		 .style("fill", function (d) {
			 var datum = d.data['series' + i].data;
			 return viz.getStyle('bar-fill', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
		 })
		 .style("fill-opacity", function (d) {
			 var datum = d.data['series' + i].data;
			 return viz.getStyle('bar-fill-opacity', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
		 })
		 .style("stroke", function (d, i) {
			 var datum = d.data['series' + i].data;
			 return viz.getStyle('bar-stroke', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
		 })
		 .style("stroke-opacity", function (d, i) {
			 var datum = d.data['series' + i].data;
			 return viz.getStyle('bar-stroke-opacity', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
		 });
		
		d3.select(leftAxis
		 .selectAll('.tick text').nodes()[groupIndex])
		 .transition()
		 .style("font-size", function () {
			 return viz.getStyle('axis-font-size') + "px"
		 })
		 .style("fill", function (d, i) {
			 return viz.getStyle('label-color', arguments)
		 })
		 .style("font-weight", function (d, i) {
			 return viz.getStyle('axis-font-weight', arguments)
		 })
		 .style("text-decoration", null)
		 .style("fill-opacity", .8)
		 .style("opacity", function () {
			 return viz.width() > 399 ? 1 : 0
		 });
		
	}
	
	function dataTipRenderer(tip, e, d, i, x, y) {
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header3" style="font-size:12px;"> HEADER3 </div>';
		
		var h1 = scope.x(d);
		var h2 = scope.y(d);
		var h3 = scope.seriesLabel(d);
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		html = html.replace("HEADER3", h3);
		
		tip.style('height','80px').html(html);
		
		return [x-70,Math.max(y-100, 50)]
		
	}
	
	function styles_getDropShadow() {
		var w = viz.width();
		return "url(" + vizuly2.svg.filter.dropShadow(
			viz,
			w / 300,
			w / 300,
			w / 200) + ")";
	}
	
	initialize();
	
	// Returns our viz component :)
	return viz;
	
};