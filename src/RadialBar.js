/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 This source code is covered under the following license: http://vizuly2.io/commercial-license/
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.220

/**
 * @class
 */
vizuly2.viz.RadialBar = function (parent) {
	
	
	var d3 = vizuly2.d3;
	
	/** @lends vizuly2.viz.RadialBar.properties */
	var properties = {
		/**
		 * Array of Arrays. Each array represents a series of data.  Assumes each series has the same length and same collection of yScale ordinal values.
		 * @member {Array}
		 * @default Needs to be set at runtime
		 *
		 * @example
		 * [
		 *  // Series 1 (Gold)
		 *  [
		 *   {"country": "USA", "category": "Gold", "value": "1072"},
		 *   {"country": "USSR", "category": "Gold", "value": "473"},
		 *   ...
		 *  ],
		 *  // Series 2 (Silver)
		 *  [
		 *   {"country": "USA", "category": "Silver", "value": "859"},
		 *   {"country": "USSR", "category": "Silver","value": "376"},
		 *   ...
		 *  ],
		 *  // Series 3 (Bronze)
		 *  [
		 *   {"country": "USA", "category": "Bronze", "value": "749"},
		 *   {"country": "USSR", "category": "Bronze","value": "355"},
		 *   ...
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
		 * Determines layout of chart.  Can use either 'CLUSTERED' or 'STACKED'
		 * @member {String}
		 * @default 'CLUSTERED'
		 */
		'layout': vizuly2.viz.layout.CLUSTERED,
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
		 * Padding between bars as expressed as a percentage of total space allocated to a bar group.
		 * @member {Number}
		 * @default 0.15
		 *
		 */
		'padding': 0.15,
		/**
		 * Function that returns the datum property used to calculate the width of the bar.  This accessor is called for each bar that is being rendered.
		 * @member {Function}
		 * @default  Must be set at runtime
		 * @example
		 * viz.x(function(d,i) { return Number(d.myProperty) });
		 */
		'x': null,
		/**
		 * Function that returns the datum property used to calculate the length of a bar .  This accessor is called for each bar that is being rendered.
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
		'seriesLabel' : function (d) { return d.series },
		'xScale': 'undefined',           // Default xScale (can be overridden after 'validate' event via callback)
		/**
		 *  Scale type used to measure the radial length of each bar.  The scale, or scale properties can be overridden by capturing the
		 * "measure" event and accessing/modifying the scale.  The default scale is a custom vizuly log scale.
		 * @member {d3.scale}
		 * @default vizuly2.util.scaleRadial
		 * @example
		 * viz.on('measure', function () { viz.yScale().range([0, 300]) }) //Sets max radial length of 300
		 */
		'yScale': vizuly2.util.scaleRadial(),
		/**
		 * Number of y axis ticks (circular rings/labels) to display
		 * @member {Number}
		 * @default 10
		 */
		'yTickCount': 5,
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
		 * Label formatter for the x axis.  Can be customized to modify labels along axis.
		 * @member {function}
		 * @default function (d) { return d }
		 * @example
		 * //Sets each axis tick label to a currency format
		 * viz.xTickFormat(function (d, i) { return '$' + d3.format('.2f')(d) })
		 */
		'xAxisTickFormat': function (d) { return d },
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
		 *function dataTipRenderer(tip, e, d, i, x, y) {
		 *	var tipWidth = 100;
		 *
		 *	var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 *		'<div class="vz-tip-header-rule" style="width:90px"></div>' +
		 *		'<div class="vz-tip-header2"> HEADER2 </div>' +
		 *		'<div class="vz-tip-header-rule" style="width:90px"></div>' +
		 *		'<div class="vz-tip-header3" style="font-size:12px;"> HEADER3 </div>';
		 *
		 *	var h1 = scope.x(d);
		 *	var h2 = scope.y(d);
		 *	var h3 = scope.seriesLabel(d);
		 *
		 *	html = html.replace("HEADER1", h1);
		 *	html = html.replace("HEADER2", h2);
		 *	html = html.replace("HEADER3", h3);
		 *
		 *	var datum = d3.select(e).datum();
		 *	var a = (datum.startAngle + datum.endAngle)/2;
		 *	var r = datum.outerRadius;
		 *
		 *	a = a - (90 * Math.PI/180)
		 *	r = r + 80;
		 *
		 *	var tangent = [r * Math.cos(a), r * Math.sin(a)]
		 *
		 *	var bounds = svg.node().getBoundingClientRect();
		 *	var tipRadius = 70;
		 *	var tipTopLeft = [tipRadius * Math.cos(225 * Math.PI/180) + tangent[0], tipRadius * Math.sin(225 * Math.PI/180) + tangent[1]]
		 *
		 *	var x = bounds.left + size.left + size.width/2;
		 *	var y = bounds.top + window.pageYOffset  + size.top + size.height/2;
		 *
		 *	tip.style('width', tipWidth + 'px').style('height', (tipWidth * .75) + 'px').html(html);
		 *
		 *	return [tipTopLeft[0] + x, tipTopLeft[1] + y]
		 *}
		 */
		'dataTipRenderer': dataTipRenderer
	};
	
	var styles = {
		'background-opacity': 1,
		'background-color-top': '#FFF',
		'background-color-bottom': '#DDD',
		'label-color': '#000',
		'bar-use-drop-shadow': false,
		'bar-fill': function (d, i, groupIndex) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return colors[groupIndex % colors.length]
		},
		'bar-fill-opacity': function (d, i) {
			return (1 - ((i) / (scope.data.length + 1)));
		},
		'bar-fill-over': function (d, i, groupIndex) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return d3.rgb(colors[groupIndex % colors.length]).darker()
		},
		'bar-fill-over-opacity': 1,
		'bar-stroke': function (d, i, groupIndex) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return d3.rgb(colors[groupIndex % colors.length]).darker()
		},
		'bar-stroke-opacity': function (d, i) {
			return (scope.layout == vizuly2.viz.layout.STACKED) ? 0.7 : .3
		},
		'bar-stroke-over': '#FFF',
		'bar-stroke-over-opacity': 0.9,
		'axis-font-weight': 400,
		'axis-font-size': function () {
			return Math.max(8, Math.round(Math.min(size.width, size.height)/50))
		},
		'axis-stroke': '#777',
		'axis-opacity': .5
	}
	
	/** @lends vizuly2.viz.RadialBar.events */
	var events = [
		/**
		 * Fires when user moves the mouse over a bar.
		 * @event vizuly2.viz.RadialBar.mouseover
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
		 * Fires when user moves the mouse off a bar.
		 * @event vizuly2.viz.RadialBar.mouseout
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
		 * Fires when user clicks a bar.
		 * @event vizuly2.viz.RadialBar.click
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
	
	var scope = {};
	scope.initialize = initialize;
	scope.properties = properties;
	scope.styles = styles;
	scope.events = events;
	
	var viz = vizuly2.core.component(parent, scope);
	viz.version = '2.1.220';
	
	// Measurements
	
	var size;           // Holds the 'size' variable as defined in viz.util.size()
	var barWidth;       // measured bar width
	var groupWidth;     // measured bar group width
	var seriesScalePadding = 0; //Used for scaleoffset
	var stack;          // used for the stacked bar layout
	var stackSeries;
	var axisFontSize;
	
	var innerRadius;
	var outerRadius;
	
	//These are all d3.selection objects we use to insert and update svg elements into
	var svg, g, bottomAxis, yAxis, plot, barGroup, background, plotBackground, defs;
	
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the individual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as D3 selections.
	function initialize() {
		
		svg = scope.selection.append('svg').attr('id', scope.id).style('overflow', 'visible').attr('class', 'vizuly');
		defs = vizuly2.util.getDefs(viz);
		background = svg.append('rect').attr('class', 'vz-background');
		g = svg.append('g').attr('class', 'vz-radial-bar');
		bottomAxis = g.append('g').attr('class', 'vz-bottom-axis');
		yAxis = g.append('g').attr('class', 'vz-y-axis');
		plot = g.append('g').attr('class', 'vz-plot');
		plotBackground = plot.append('rect').attr('class', 'vz-plot-background').style('fill', '#FFF').style('fill-opacity', .01);
		
		// Tell everyone we are done initializing
		scope.dispatch.apply('initialized', viz);
	}
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		if (size.measuredWidth < size.measuredHeight) {
			innerRadius = vizuly2.util.getRelativeWidth(scope.innerRadius, scope.selection.node());
			outerRadius = vizuly2.util.getRelativeWidth(scope.outerRadius, scope.selection.node());
		}
		else {
			innerRadius = vizuly2.util.getRelativeHeight(scope.innerRadius, scope.selection.node());
			outerRadius = vizuly2.util.getRelativeHeight(scope.outerRadius, scope.selection.node());
		}
		
		
		// The width of each group of bars for a given data point and all of series
		groupWidth = ((360 * Math.PI/180) / scope.data[0].length) * (1 - scope.padding);
		
		// The width of an individual bar for a given data point a single series
		barWidth = (groupWidth / scope.data.length) * (1 - scope.padding);
		
		// If we don't have a defined x-scale then determine one
		if (scope.xScale == 'undefined') {
			scope.xScale = vizuly2.util.getTypedScale(viz.x()(scope.data[0][0]));
		}
		
		// Set our domains for the yScale (categories)
		// Assumes ordinal scale if we have a string, otherwise min and max will do;
		if (typeof scope.x(scope.data[0][0]) == 'string') {
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
			stackKeys.push('series' + i);
		})
		
		for (var columnIndex = 0; columnIndex < scope.data[0].length; columnIndex++) {
			var row = {};
			scope.data.forEach(function (series, i) {
				row['series' + i] = {}
				row['series' + i].data = series[columnIndex];
			})
			stackSeries.push(row);
		}
		
		var offset = (scope.layout == vizuly2.viz.layout.STACKED) ? d3.stackOffsetNone : vizuly2.util.stackOffsetBaseline;
		
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
		scope.yScale.range([innerRadius, outerRadius]);
		
		seriesScalePadding = 0;
		
		//Makes sure our range is correct for continous scales
		if (typeof scope.xScale.clamp != 'undefined') {
			seriesScalePadding = 35;
		}
		scope.xScale.range([12 * Math.PI/180, (360 - seriesScalePadding) * Math.PI/180]);
		
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
		svg.attr('width', size.measuredWidth).attr('height', size.measuredHeight);
		background.attr('width', size.measuredWidth).attr('height', size.measuredHeight);
		plot.style('width', size.width).style('height', size.height).attr('transform', 'translate(' + (size.left + size.width/2) + ',' + (size.top + size.height/2) + ')');
		bottomAxis.attr('transform', 'translate(' + (size.left + size.width/2) + ',' + (size.top + size.height/2) + ')');
		yAxis.attr('transform', 'translate(' + (size.left + size.width/2) + ',' + (size.top + size.height/2) + ')');
		plotBackground.attr('width', size.width).attr('height', size.height);
		
		// Select, create, and destroy our bar groups as needed
		barGroup = plot.selectAll('.vz-bar-group').data(stackSeries[0]);
		barGroup = barGroup.enter().append('g').attr('class', 'vz-bar-group').merge(barGroup);
		barGroup.exit().remove();
		
		// Create bars in each group - even if there is only one
		barGroup.each(function (datum, index) {
			var bars = d3.select(this).selectAll('.vz-bar').data(stackSeries.map(function (series, i) {
				return series[index];
			}));
			
			bars.exit().remove();
			
			bars = bars.enter().append('path')
			 .attr('class','vz-bar')
			 .attr('d', d3.arc()
				.innerRadius(innerRadius)
				.outerRadius(innerRadius+1)
				.startAngle(function(d, i) { return scope.xScale(scope.x(d.data['series' + i].data)) + (i * barWidth); })
				.endAngle(function(d, i) { return scope.xScale(scope.x(d.data['series' + i].data)) + (i * barWidth) + barWidth; })
				.padAngle(0.01)
				.padRadius(innerRadius))
			 .on('mouseover', function (d, i) {
				 scope.dispatch.apply('mouseover', viz, [this, d.data['series' + i].data, i, index])
			 })
			 .on('mouseout', function (d, i) {
				 scope.dispatch.apply('mouseout', viz, [this, d.data['series' + i].data, i, index]);
			 })
			 .on('click', function (d, i) {
				 scope.dispatch.apply('click', viz, [this, d.data['series' + i].data, i, index])
			 })
			 .on('touch', function (d, i) {
				 scope.dispatch.apply('touch', viz, [this, d.data['series' + i].data, i, index])
			 })
			 .merge(bars);
			
			bars.transition().duration(scope.duration)
			 .attr('d', d3.arc()
				.innerRadius(function(d, i) { return scope.yScale(d[0]); })
				.outerRadius(function(d, i) { d.outerRadius = (scope.layout == vizuly2.viz.layout.STACKED) ? scope.yScale(d[0] + (d[1] - d[0])) : scope.yScale(d[1]); return d.outerRadius; })
				.startAngle(function(d, i) { d.startAngle = scope.xScale(scope.x(d.data['series' + i].data)) + (scope.layout == vizuly2.viz.layout.STACKED ? 0 : (i * barWidth)); return d.startAngle })
				.endAngle(function(d, i) { d.endAngle = scope.xScale(scope.x(d.data['series' + i].data)) + (scope.layout == vizuly2.viz.layout.STACKED ? groupWidth - (groupWidth * scope.padding) : (i * barWidth) + barWidth - (barWidth * scope.padding)); return d.endAngle })
				.padAngle(0.01)
				.padRadius(innerRadius));
			
		});
		
		
		bottomAxis.selectAll('g').remove();
		
		var xAxisLabels = bottomAxis.selectAll("g")
		 .data(scope.data[0])
		 .enter()
		 .append("g")
		 .attr("text-anchor", "middle")
		 .attr("transform", function(d) { return "rotate(" + ((scope.xScale(scope.x(d)) + (groupWidth - (groupWidth * scope.padding)) / 2 ) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; });
		
		xAxisLabels.append("text")
		 .attr("transform", function(d) { return (scope.xScale(scope.x(d)) + (groupWidth - (groupWidth * scope.padding))/ 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0," + innerRadius/9 + ")" : "rotate(-90)translate(0,-" + innerRadius/9 + ")"; })
		 .text(function(d) { return scope.xAxisTickFormat(scope.x(d)); });
		
		yAxis.selectAll('.tick').remove();
		
		var yTick = yAxis
		 .selectAll('g')
		 .data(scope.yScale.ticks(scope.yTickCount ).slice(1))
		 .enter()
		 .append('g')
		 .attr('class','tick');
		
		yTick.append('circle')
		 .style('fill','none')
		 .attr('r', scope.yScale);
		
		yTick.append('text')
		 .attr('y', function(d) { return -scope.yScale(d); })
		 .style('fill', 'none')
		 .style('text-anchor','middle')
		 .text(function (d) { return scope.yTickFormat(d) });
		
		
		// Let everyone know we are doing doing our update
		// Typically themes will attach a callback to this event so they can apply styles to the elements
		scope.dispatch.apply('updated', viz);
		
	}
	
	/**
	 *  Triggers the render pipeline process to refresh the component on the screen.
	 *  @method  vizuly2.viz.RadialBar.update
	 */
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
		
		// The width and height of the viz
		var w = size.measuredWidth;
		var h = size.measuredHeight;
		
		// Grab the d3.selection from the viz so we can operate on it.
		var selection = scope.selection;
		
		var styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-color-bottom'), viz.getStyle('background-color-top'));
		
		axisFontSize = Math.max(8, Math.round(outerRadius / 65))
		
		// Update the background
		selection.selectAll('.vz-background').style('fill', function () {
			 return 'url(#' + styles_backgroundGradient.attr('id') + ')';
		 })
		 .style('opacity',viz.getStyle('background-opacity'));
		
		// Hide the plot background
		selection.selectAll('.vz-plot-background').style('opacity', 0);
		
		//Making sure all of our bars/columns have a white stroke, which is universal to the theme.
		var bar = selection.selectAll('.vz-plot .vz-bar')
		 .style('stroke', '#FFF');
		
		bar.style('stroke-width', function () {
			 return (w / 1000) + 'px';
		 })
		 .style('stroke-opacity', viz.getStyle('bar-stroke-opacity'));
		
		//Here we select all the bars and apply filters and fills.  In the case of these styless
		//we are using **svg drop-shadow filters** and **linear gradients** for the fills.
		selection.selectAll('.vz-bar-group').each(
		 function (datum, index) {
			 d3.select(this).selectAll('path.vz-bar')
				.style('filter', function (d, i) {
					return viz.getStyle('bar-use-drop-shadow', arguments) === true ? styles_getDropShadow() : null;
				})
				.style('fill', function (d, i) {
					var datum = d.data['series' + i].data;
					return viz.getStyle('bar-fill', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
				})
				.style('fill-opacity', function (d, i) {
					var datum = d.data['series' + i].data;
					return viz.getStyle('bar-fill-opacity', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
				})
				.style('stroke', function (d, i) {
					var datum = d.data['series' + i].data;
					return viz.getStyle('bar-stroke', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
				})
				.style('stroke-opacity', function (d, i) {
					var datum = d.data['series' + i].data;
					return viz.getStyle('bar-stroke-opacity', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
				})
			 
		 });
		
		// Update axis fonts
		selection.selectAll('.vz-bottom-axis text, .vz-y-axis text')
		 .attr('dy', function (d,i) { return viz.getStyle('axis-font-size', arguments)/4 })
		 .style("font-weight", function () {
			 return viz.getStyle('axis-font-weight', arguments)
		 })
		 .style("fill", function () {
			 return viz.getStyle('label-color')
		 })
		 .style("fill-opacity", .8)
		 .style("font-size", function (d,i) { return viz.getStyle('axis-font-size', arguments) + "px" });
		
		selection.selectAll('.vz-bottom-axis text')
		 .style("font-size", (innerRadius/9) + 'px')
		
		// Update axis
		selection.selectAll('.vz-bottom-axis line, .vz-y-axis circle')
		 .style('stroke', function () {
			 return viz.getStyle('axis-stroke')
		 })
		 .style('stroke-width', 1)
		 .style('opacity', function () {
			 return viz.getStyle('axis-opacity')
		 })
		
		
		selection.selectAll('.vz-y-axis').attr('font-family', null)
		selection.selectAll('.vz-bottom-axis').attr('font-family', null)
		selection.selectAll('.vz-bottom-axis path.domain').style('display', 'none');
		selection.selectAll('.vz-y-axis path.domain').style('display', 'none');
		selection.selectAll('.vz-bottom-axis line').style('display', 'none');
		
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function styles_onMouseOver(bar, d, i) {
		
		var groupIndex = scope.xScale.domain().indexOf(scope.x(d))
		
		var datum = d3.select(bar).datum();
		
		//Making style and color changes to our bar for the <code>mouseover</code>.
		d3.select(bar)
		 .style('fill', function () {
			 return viz.getStyle('bar-fill-over', [d, i, groupIndex])
		 })
		 .style('fill-opacity', function () {
			 return viz.getStyle('bar-fill-over-opacity', [d, i, groupIndex])
		 })
		 .style('stroke', function () {
			 return viz.getStyle('bar-stroke-over',[d, i, groupIndex])
		 })
		 .style('stroke-opacity', function () {
			 return viz.getStyle('bar-stroke-over-opacity', [d, i, groupIndex])
		 })
		 .attr('filter', function () {
			 return viz.getStyle('bar-over-filter', [d, i, groupIndex])
		 })
		
		viz.showDataTip(bar, d, i);
	}
	
	//On <coce>mouseout</code> we want to undo any changes we made on the <code>mouseover</code>.
	function styles_onMouseOut(bar, d, i) {
		
		viz.removeDataTip();
		
		plot.selectAll(".vz-y-axis-mouseover").remove();
		
		var groupIndex = scope.yScale.domain().indexOf(scope.y(d))
		
		d3.select(bar)
		 .style('fill', function (d) {
			 var datum = d.data['series' + i].data;
			 return viz.getStyle('bar-fill', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
		 })
		 .style('fill-opacity', function (d) {
			 var datum = d.data['series' + i].data;
			 return viz.getStyle('bar-fill-opacity', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
		 })
		 .style('stroke', function (d, i) {
			 var datum = d.data['series' + i].data;
			 return viz.getStyle('bar-stroke', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
		 })
		 .style('stroke-opacity', function (d, i) {
			 var datum = d.data['series' + i].data;
			 return viz.getStyle('bar-stroke-opacity', [datum, i, scope.xScale.domain().indexOf(scope.x(datum)), this])
		 });
		
	}
	
	function dataTipRenderer(tip, e, d, i, x, y) {
		
		var tipWidth = 100;
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule" style="width:90px"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule" style="width:90px"></div>' +
		 '<div class="vz-tip-header3" style="font-size:12px;"> HEADER3 </div>';
		
		var h1 = scope.x(d);
		var h2 = scope.y(d);
		var h3 = scope.seriesLabel(d);
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		html = html.replace("HEADER3", h3);
		
		var datum = d3.select(e).datum();
		var a = (datum.startAngle + datum.endAngle)/2;
		var r = datum.outerRadius;
		
		a = a - (90 * Math.PI/180)
		r = r + 80;
		
		var tangent = [r * Math.cos(a), r * Math.sin(a)]
		
		var bounds = svg.node().getBoundingClientRect();
		var tipRadius = 70;
		var tipTopLeft = [tipRadius * Math.cos(225 * Math.PI/180) + tangent[0], tipRadius * Math.sin(225 * Math.PI/180) + tangent[1]]
		
		var x = bounds.left + size.left + size.width/2;
		var y = bounds.top + window.pageYOffset  + size.top + size.height/2;
		
		tip.style('width', tipWidth + 'px').style('height', (tipWidth * .75) + 'px').html(html);
		
		return [tipTopLeft[0] + x, tipTopLeft[1] + y]
		
	}
	
	function styles_getDropShadow() {
		var w = size.measuredWidth;
		return "url(" + vizuly2.svg.filter.dropShadow(
		 viz,
		 w / 300,
		 w / 300,
		 w / 200) + ")";
	}
	
	// Returns our glorious viz component :)
	return viz;
}