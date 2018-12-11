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

// @version 2.1.45

/**
 * @class
 */
vizuly2.viz.SunBurst = function (parent) {
	
	var d3 = vizuly2.d3;
	
	/** @lends vizuly2.viz.SunBurst.properties */
	var properties = {
		/**
		 * Hierarchical nested array of nodes to be rendered.
		 * @member {Array}
		 * @default Needs to be set at runtime
		 * @example
		 * [{
		 * "key": "Pensions",
		 * "values": [
		 *  {
		 *  "key": "Old age",
		 *  "values": [
		 *   {
		 *     "key": "Federal employee retirement and disability (602)",
		 *     "values": [
		 *      {
		 *        "Category": "Special Benefits",
		 *        "Level1": "Pensions",
		 *        "Level2": "Old age",
		 *        "Level3": "Federal employee retirement and disability (602)",
		 *        "Level4": "Special Benefits",
		 *        "Federal": "0.38",
		 *         ...
		 */
		'data': null,
		/**
		 * Width of component in either pixels (Number) or percentage of parent container (%)
		 * @member {Number}
		 * @default 600
		 */
		'width': 600,
		/**
		 * Height of component in either pixels (Number) or percentage of parent container (%)
		 * @member {Number}
		 * @default 600
		 */
		'height': 600,
		/**
		 * Margins between component render area and border of container.  This can either be a fixed pixels (Number) or a percentage (%) of height/width.
		 * @member {Object}
		 * @default  {top:'5%', bottom:'5%', left:'8%', right:'10%'}
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
		 * Function used to access the array of values representing child nodes for a given branch.
		 * @member {Function}
		 * @default function (d) { return d.values }
		 */
		'children': function (d) {
			return d.values
		},
		/**
		 * Function that returns value that determines arc length of a given segment
		 * @member {String}
		 * @default function (d) { return d.value }
		 */
		'value': function (d) {
			return d.value
		},
		/**
		 * Function that returns string value used in data tip.
		 * @member {String}
		 * @default function (d) { return d.value }
		 */
		'valueLabel': function (d) {
			return d.value;
		},
		/**
		 * Function that returns a unique identifier for a given datum.
		 *
		 * @member {String}
		 * @default function (d) { return d.key }
		 *
		 */
		'key': function (d) {
			return d.key
		},
		/**
		 * Function that returns string label displayed in each arc.
		 * @member {String}
		 * @default function (d) { return d.label }
		 */
		'label': function (d) {
			return d.label
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
		 *	  var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 *		var bounds = e.getBoundingClientRect();
		 *		var x1 = d3.event.pageX; - bounds.left;
		 *		var y1 = d3.event.pageY; - bounds.top;
		 *
		 *		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 *		 '<div class="vz-tip-header-rule"></div>' +
		 *		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 *		 '<div class="vz-tip-header-rule"></div>' +
		 *		 '<div class="vz-tip-header3" style="font-size:12px;"> HEADER3 </div>';
		 *
		 *		var h1 = scope.label(d.data);
		 *		var h2 = scope.valueLabel(d.data);
		 *		var h3 = "Level: " + d.depth;
		 *
		 *		html = html.replace("HEADER1", h1);
		 *		html = html.replace("HEADER2", h2);
		 *		html = html.replace("HEADER3", h3);
		 *
		 *		tip.style('height','80px').html(html);
		 *
		 *		return [x1 - 100, y1 - 120];
		 *}
		 */
		'dataTipRenderer': dataTipRenderer
	};
	
	var styles = {
		'background-opacity': 1,
		'background-color-top': "#FFF",
		'background-color-bottom': "#e2e2e2",
		'stroke': function (d, i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A']
			var c = d3.rgb(colors[(d.data.rootIndex ? d.data.rootIndex : 0) % colors.length]);
			return c.darker((d.depth) / (maxDepth * .75))
		},
		'stroke-opacity': 0.9,
		'fill': function (d, i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A']
			var c = d3.rgb(colors[(d.data.rootIndex ? d.data.rootIndex : 0) % colors.length]);
			return c.darker((d.depth - 1) / maxDepth)
		},
		'fill-over': function (d, i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A']
			var c = d3.rgb(colors[(d.data.rootIndex ? d.data.rootIndex : 0) % colors.length]);
			return c.brighter((d.depth) / maxDepth)
		},
		'label-color': function (d,i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A']
			var c = d3.rgb(colors[(d.data.rootIndex ? d.data.rootIndex : 0) % colors.length]);
			return vizuly2.core.util.colorBrightness(c) > 128 ? '#333' : '#DDD';
		},
		'label-font-size': function (d,i) {
			return Math.round(radius/maxDepth) * .2;
		},
		'header-font-size': function ()  {
			return size.height * 0.0266;
		}
	};
	
	
	/** @lends vizuly2.viz.SunBurst.events */
	var events = [
		/**
		 * Fires when user moves the mouse over an arc plot.
		 * @event vizuly2.viz.SunBurst.mouseover
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
		 * Fires when user moves the mouse off an arc plot.
		 * @event vizuly2.viz.SunBurst.mouseout
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
		 * Fires when user clicks on a given arc plot.
		 * @event vizuly2.viz.SunBurst.click
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param j -  The series index of the datum
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('click', function (e, d, i) { ... });
		 */
		'click'
	 ];
	
	// This is the object that provides pseudo "protected" properties that the vizuly.viz function helps create
	var scope = {};
	scope.initialize = initialize;
	scope.properties = properties;
	scope.styles = styles;
	scope.events = events;
	
	// Create our Vizuly component
	var viz = vizuly2.core.component(parent, scope);
	
	//Measurements
	var size;                   // Holds the 'size' variable as defined in viz.util.size()
	var radius;
	
	//These are all d3.selection objects we use to insert and update svg elements into
	var svg, g, background, plot, plotBackground, defs, drillUp, header;
	
	var xScale = d3.scaleLinear()
	 .range([0, 2 * Math.PI]);
	
	var yScale = d3.scaleSqrt()
	
	var partition = d3.partition();
	var root;
	var nodes;
	var maxDepth;
	var headerHeight;
	
	var arc = d3.arc()
	 .startAngle(function (d) {
		 d.r = (Math.max(0, yScale(d.y0)) +  Math.max(0, yScale(d.y1)))/2;
		 d.startAngle = Math.max(0, Math.min(2 * Math.PI, xScale(d.x0)));
		 return d.startAngle;
	 })
	 .endAngle(function (d) {
		 d.endAngle = Math.max(0, Math.min(2 * Math.PI, xScale(d.x1)));
		 return d.endAngle;
	 })
	 .innerRadius(function (d) {
		 return Math.max(0, yScale(d.y0));
	 })
	 .outerRadius(function (d) {
		 return Math.max(0, yScale(d.y1));
	 });
	
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  They all are referenced as d3.selections.
	function initialize() {
		
		scope.selection.style('position','relative')
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		defs = vizuly2.core.util.getDefs(viz);
		background = svg.append("rect").attr("class", "vz-background");
		g = svg.append("g").attr("class", "vz-sunburst");
		plot = g.append("g").attr("class", "vz-sunburst-plot");
		plotBackground = plot.append("rect").attr("class", "vz-plot-background");
		drillUp = g.append('g').attr('class','.vz-sunburst-drill-up').append('path').attr('d','M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z')
		 .style('pointer-events','none')
		 .style('opacity',0)
		
		header = scope.selection
		 .append('div')
		 .attr('class','vz-sunburst-header')
		 .style('position','absolute')
		 .style('top','0px')
		
		// Tell everyone we are done initializing
		scope.dispatch.apply('initialized', viz);
	}

	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		headerHeight = viz.getStyle('header-font-size') * 2;
		
		radius = Math.min(size.width / 2, size.height / 2);
		
		scope.children(scope.data).sort(function (a, b) {
			return scope.value(b) - scope.value(a);
		})
		
		var rootKeys = [];
		scope.children(scope.data).forEach(function (d) {
			rootKeys.push(scope.key(d));
		})
		
		root = d3.hierarchy(scope.data, scope.children);
		root.sum(scope.value)
		
		nodes = partition(root).descendants()
		
		maxDepth = d3.max(nodes, function (d) {
			return d.depth
		});
		
		scope.children(scope.data).forEach(function (d, i) {
			setRootKey(d, scope.key(d), i);
		})
		
		yScale.range([0, radius]).domain([0,1]);
		
		scope.size = size;
		
		// Tell everyone we are done making our measurements
		scope.dispatch.apply('measured', viz);
		
	}
	
	// The update function is the primary function that is called when we want to render the visualization based on
	// all of its set properties.  A developer can change properties of the components and it will not show on the screen
	// until the update function is called
	function update() {
		
		// Call measure each time before we update to make sure all our our layout properties are set correctly
		measure();
		
		// Layout all of our primary SVG d3.elements.
		svg.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		background.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		plot.style("width", size.width).style("height", size.height).attr("transform", "translate(" + (size.left + radius) + "," + (size.top + radius) + ")");
		
		var paths = plot.selectAll(".vz-sunburst-arc").data(nodes)
		
		paths.exit().remove();
		
		paths = paths.enter().append("path")
		 .attr("class", function (d) {
			 return "vz-sunburst-arc " + d.data.cssKey
		 })
		 .on("click", onClick)
		 .on("mouseover", function (d, i) {
			 scope.dispatch.apply('mouseover', viz, [this, d.data, i, d])
		 })
		 .on("mouseout", function (d, i) {
			 scope.dispatch.apply('mouseout', viz, [this, d.data, i, d])
		 })
		 .merge(paths)
		 .attr("d", arc);
		
		defs.selectAll(".vz-sunburst-arc-path").remove();
		
		paths
		 .transition()
		 .call(function (transition) { vizuly2.core.util.transitionOnEnd(transition, updateLabels)})
		 .duration(scope.duration)
		 .tween("scale", function (d) {
			 var xd = d3.interpolate([0, 10], [0, 1]),
				yd = d3.interpolate(yScale.domain(), [d.y0, 1]),
				yr = d3.interpolate([0, 1], [0, radius]);
			 return function (t) {
				 xScale.domain(xd(t));
				 yScale.range(yr(t));
			 };
		 })
		 .attrTween("d", function (d) {
			 return function () {
				 return arc(d);
			 };
		 });
		
		drillUp.attr('transform','translate(' + (size.left + radius - 12) + ',' + (size.top + radius - 12) + ')')
			.style('opacity',0);
		
		updateHeaderLabel(scope.data)
		
		// Let everyone know we are doing doing our update
		// Typically themes will attach a callback to this event so they can apply styles to the elements
		scope.dispatch.apply('updated', viz);
	}
	
	function updateLabels() {
		
		var labelNodes = nodes.filter(function (d) {
			d.arcLength = (d.endAngle - d.startAngle) * d.r;
			return (scope.label(d.data).length * viz.getStyle('label-font-size')/2) < d.arcLength && d.depth > 0
		})
		
		defs.selectAll(".vz-sunburst-arc-path").remove();
		defs.selectAll(".vz-sunburst-arc-path")
		 .data(labelNodes)
		 .enter()
		 .append("path")
		 .attr("class", "vz-sunburst-arc-path")
		 .attr("id", function (d, i) {
			 return scope.id + "_sunburst_text_arc_" + i;
		 })
		 .attr("d", function (d, i) {
			 return vizuly2.svg.text.textArcPath(d.r, (d.startAngle + d.endAngle)/2);
		 });
		
		// Create xAxis Labels using the def arc paths we created above
		plot.selectAll(".vz-sunburst-label").remove();
		plot.selectAll(".vz-sunburst-label")
		 .data(labelNodes)
		 .enter().append("g")
		 .attr("class", "vz-sunburst-label")
		 .style('pointer-events','none')
		 .append("text")
		 .attr("dy",function (d,i) { return viz.getStyle('label-font-size',arguments)/2 + 'px'})
		 .style('opacity',0)
		 .style('font-size','0px')
		 .append("textPath")
		 .attr("text-anchor", "middle")
		 .attr("startOffset", "50%")
		 .style("overflow", "visible")
		 .style('fill',function (d,i) { return viz.getStyle('label-color',arguments)})
		 .attr("xlink:href", function (d, i) {
			 return "#" + scope.id + "_sunburst_text_arc_" + i;
		 })
		 .text(function (d, i) {
			 return scope.label(d.data);
		 })
		
		
		plot.selectAll(".vz-sunburst-label text")
		 .style('display',function (d) {
			 var length = d3.select(this).node().getComputedTextLength();
			 return length > d.arcLength ? 'none' : 'block';
		 })
		 .transition()
		 .style('font-size',function (d,i) { return viz.getStyle('label-font-size',arguments) + 'px'})
		 .style('opacity',1)
	}
	
	function setRootKey(d, key, index) {
		d.rootKey = key;
		d.rootIndex = index;
		d._originalValue = scope.value(d);
		d.cssKey = vizuly2.core.util.createCSSKey(scope.key(d));
		if (scope.children(d)) {
			scope.children(d).forEach(function (child) {
				setRootKey(child, key, index);
			})
		}
	}
	
	function onClick(d, i) {
		drillUp.style('opacity', (d.depth == 0) ? 0 : 1);
		
		plot.selectAll(".vz-sunburst-label").transition().style('opacity',0)
		
		var transitions = 0;
		
		plot.transition()
		 .call(function(transition) {
		 	vizuly2.core.util.transitionOnEnd(transition, updateLabels)
		 })
		 .duration(750)
		 .tween("scale", function () {
			 var xd = d3.interpolate(xScale.domain(), [d.x0, d.x1]),
				yd = d3.interpolate(yScale.domain(), [d.y0, 1]),
				yr = d3.interpolate(yScale.range(), [d.y0 ? 20 : 0, radius]);
			 return function (t) {
				 xScale.domain(xd(t));
				 yScale.domain(yd(t)).range(yr(t));
			 };
		 })
		 .selectAll(".vz-sunburst-arc")
		 .attrTween("d", function (d) {
			 return function () {
				 return arc(d);
			 };
		 })

		updateHeaderLabel(d);
		applyStyles();
		scope.dispatch.apply('click', viz, [this, d.data, i, d])
	}
	
	function updateHeaderLabel(d) {
		header.selectAll('.vz-sunburst-header-label').remove();
		createKeyPath(d);
		header.selectAll('.vz-sunburst-header-label')
		 .filter(function (d, i, nodeList) {
			 return (nodeList.length-1 != i)
		 })
		 .on('click', onClick)
	}
	
	function createKeyPath(d) {
		var key = (d.data) ? scope.label(d.data) : scope.label(d);
		
		if (d.depth > 0) {
			var color = viz.getStyle('fill',[d]);
		}
		
		header.insert('span','.vz-sunburst-header-label')
		 .attr('class', 'vz-sunburst-header-label')
		 .datum(d)
		 .style('text-transform','uppercase')
		 .text(((d.depth > 0) ? ' > ' : '') + key);
		
		if (d.parent) {
			createKeyPath(d.parent);
		}
	
	}

	
	// This is our public update call that all viz components implement
	viz.update = function () {
		update();
		return viz;
	};
	
	// styles and styles
	var stylesCallbacks = [
		{on: 'updated.styles', callback: applyStyles},
		{on: 'mouseover.styles', callback: styles_onMouseOver},
		{on: 'mouseout.styles', callback: styles_onMouseOut}
	];
	
	viz.applyCallbacks(stylesCallbacks);
	
	function styles_onMouseOver(path, d, i, datum) {
		d3.select(path).style('fill', function (d, i) {
			return viz.getStyle('fill-over', [d, i])
		})
		
		if (datum.depth > 0) {
			viz.showDataTip(path, datum, i);
		}
		
	}
	
	function styles_onMouseOut(path, d, i, datum) {
		d3.select(path).style('fill', function (d, i) {
			return viz.getStyle('fill', [d, i])
		})
		viz.removeDataTip();
	}
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		var styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-color-bottom'), viz.getStyle('background-color-top'));
		
		// Update the background
		scope.selection.selectAll(".vz-background").style("fill", function () {
			return "url(#" + styles_backgroundGradient.attr("id") + ")";
		})
		 .style('opacity',viz.getStyle('background-opacity'));
		
		
		plot.selectAll(".vz-sunburst-arc")
		 .style("fill", function (d, i) {
			 return viz.getStyle('fill', arguments);
		 })
		 .style('fill-opacity', function (d,i) {
			 return (!d.data.cssKey) ? 0.01 : null;
		 })
		 .style("stroke", function (d, i) {
			 return viz.getStyle('stroke', arguments);
		 })
		 .style("stroke-opacity", function (d, i) {
			 return viz.getStyle('stroke-opacity', arguments);
		 })
		
		plot.selectAll(".vz-sunburst-label")
		 .filter(function (d) { return d.depth == 0})
		 .style('display', 'none')

		header
		 .style('font-size',function (d,i) { return viz.getStyle('header-font-size',arguments) + 'px'})
		 .style('padding',function (d,i) { return viz.getStyle('header-font-size',arguments)/2 + 'px'});
		
		header.selectAll('.vz-sunburst-header-label')
		 .style('font-weight',function (d,i, nodeList) {
			return (nodeList.length-1 == i) ? 'bold' : 'normal';
		})
		 .style('cursor',function (d,i, nodeList) {
			 return (nodeList.length-1 != i) ? 'pointer' : 'auto';
		 })
		 .style("color", function (d, i) {
			 return (d.depth > 0) ? viz.getStyle('fill', arguments) : '#777';
		 })
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function dataTipRenderer(tip, e, d, i, x, y) {
		
		var bounds = e.getBoundingClientRect();
		var x1 = d3.event.pageX; - bounds.left;
		var y1 = d3.event.pageY; - bounds.top;
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header3" style="font-size:12px;"> HEADER3 </div>';
		
		var h1 = scope.label(d.data);
		var h2 = scope.valueLabel(d.data);
		var h3 = "Level: " + d.depth;
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		html = html.replace("HEADER3", h3);
		
		tip.style('height','80px').html(html);
		
		return [x1 - 100, y1 - 120];
		
	}
	
	// Returns our viz component :)
	return viz;
	
}