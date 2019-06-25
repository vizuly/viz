/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 This source code is covered under the following license: http://vizuly2.io/commercial-license/
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.159

/**
 * @class
 */
vizuly2.viz.RadialProgress = function (parent) {
	
	var d3 = vizuly2.d3;
	
	/** @lends vizuly2.viz.RadialProgress.properties */
	var properties = {
		/**
		 * Numeric value of chart that is used to display radial progress.
		 * @member {Number}
		 * @default Needs to be set at runtime
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
		 * Determines the radius of the chart in either pixels (Number) or percentage of parent container (XX%)
		 * @member {Number/String}
		 * @default 290
		 *
		 */
		'radius': 290,
		/**
		 * Minimum value to start progress bar at.
		 * @member {Number}
		 * @default 0
		 */
		'min': 0,
		/**
		 * Maximum value to end progress bar at for a given circle.  Values exceeding the maximum will be rendered in nested circles.
		 * @member {Number}
		 * @default 1
		 */
		'max': 1,
		/**
		 * Function that returns label rendered in center of progress bar.
		 * @member {Function}
		 * @default function (d, i)  { return d; }
		 */
		'valueLabel': function (d, i)  { return d; },
		/**
		 * Function that returns label rendered in top of progress bar.
		 * @member {Function}
		 * @default function (d)  { return d; }
		 */
		'topLabel': function (d)  { return 'Top Label' },
		/**
		 * Function that returns label rendered in bottom of progress bar.
		 * @member {Function}
		 * @default function (d)  { return d; }
		 */
		'bottomLabel': function (d)  { return 'Bottom Label' },
		/**
		 * Value of radius at either end cap of bar, expressed as a percentage of bar width.
		 * A value of 1 is a full radius at end cap of bar.  A value of 0 is a square end cap.
		 * @member {Number}
		 * @default 0
		 */
		'capRadius': 0,
		/**
		 * Start angle of progress bar in degrees.   12 o'clock position is 0 degrees.  6 o'clock is 180 degrees.
		 * A value of 1 is a full radius at end cap of bar.  A value of 0 is a square end cap.
		 * @member {Number}
		 * @default 250
		 *
		 */
		'startAngle': 250,
		/**
		 * End angle of progress bar in degrees.   12 o'clock position is 0 degrees.  6 o'clock is 180 degrees.
		 * A value of 1 is a full radius at end cap of bar.  A value of 0 is a square end cap.
		 * @member {Number}
		 * @default 110
		 *
		 */
		'endAngle': 110,
		/**
		 * Thickness in pixels of each halo group arc expressed as percentage of total radius
		 * @member {Number}
		 * @default  0.05
		 */
		'arcThickness': 0.05
	};
	
	var styles = {
		'background-opacity': 1,
		'background-color-top': "#FFF",
		'background-color-bottom': "#DDD",
		'radial-fill': 'none',
		'value-label-color': '#333',
		'top-label-color': '#333',
		'bottom-label-color': '#333',
		'top-label-fill-opacity': .5,
		'bottom-label-fill-opacity': .5,
		'value-label-fill-opacity': 1,
		'track-fill': '#DDDDDD',
		'track-opacity': 1,
		'progress-fill': function (d, i) {
			var colors = ['#bd0026', '#f03b20', '#fd8d3c', '#fecc5c', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return colors[i % colors.length];
		},
		'progress-fill-opacity': 1,
		'progress-stroke': function (d, i) {
			var colors = ['#bd0026', '#f03b20', '#fd8d3c', '#fecc5c', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return colors[i % colors.length];
		},
		'value-label-font-size': function (d, i) {
			return this.size().radius * .35;
		},
		'top-label-font-size': function (d, i) {
			return this.size().radius * .1;
		},
		'bottom-label-font-size': function (d, i) {
			return this.size().radius * .1;
		}
	}
	
	/** @lends vizuly2.viz.RadialProgress.events */
	var events = [
		/**
		 * Fires when user moves the mouse over chart.
		 * @event vizuly2.viz.RadialProgress.mouseover
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
		 * Fires when user moves the mouse off chart.
		 * @event vizuly2.viz.RadialProgress.mouseout
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
		 * Fires when user clicks on chart.
		 * @event vizuly2.viz.RadialProgress.click
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
		 * Fires tween event as chart animates progress bar value.
		 * @event vizuly2.viz.RadialProgress.tween
		 * @type {VizulyEvent}
		 * @param i - iteration index of tween
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('tween', function (i) { ... });
		 */
		'tween'
	 ]
	
	var scope = {};
	scope.initialize = initialize;
	scope.properties = properties;
	scope.styles = styles;
	scope.events = events;
	
	// Create our Vizuly component
	var viz = vizuly2.core.component(parent, scope);
	
	
	//Measurements
	var size;                   // Holds the 'size' variable as defined in viz.util.size()
	var theta;                  // Calculated from start and end angle
	var radian = Math.PI / 180;   // radian constant
	var arcs = [];                // Holds array of arc objects based on the data value in respect to the min/max values
	var radius;
	
	//These are all d3.selection objects we use to insert and update svg elements into
	var svg, g, background, plot, plotBackground, arcPlot, labelPlot, backCircle, defs;
	
	// This is used to generate the arc path for the background track
	var arcTrack = d3.arc();
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		
		scope.selection.style('margin', '0px auto');
		svg = scope.selection.append('svg').attr('id', scope.id).style('overflow', 'visible').attr('class', 'vizuly').style('margin', '0px auto');
		defs = vizuly2.util.getDefs(viz);
		background = svg.append('rect').attr('class', 'vz-background');
		g = svg.append('g').attr('class', 'vz-radial_progress-viz');
		plot = g.append('g').attr('class', 'vz-radial_progress-plot');
		plotBackground = plot.append('rect').attr('class', 'vz-plot-background');
		arcPlot = plot.append('g').attr('class', 'vz-radial_progress-arc-plot');
		labelPlot = plot.append('g').attr('class', 'vz-radial_progress-value-label-plot');
		backCircle = arcPlot.append('circle').attr('class', 'vz-radial_progress-back-circle');
		
		// We attach our base events to the arcPlot
		plot.on('mouseover', function () {
			 scope.dispatch.apply('mouseover', viz, [this])
		 })
		 .on('mouseout', function () {
			 scope.dispatch.apply('mouseout', viz, [this])
		 })
		 .on('click', function () {
			 scope.dispatch.apply('click', viz, [this])
		 });
		
		// Tell everyone we are done initializing
		scope.dispatch.apply('initialized', viz)
	}
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		// Set our theta bases on start and end angles
		theta = (scope.startAngle == scope.endAngle)
		 ? 360 : (scope.startAngle > scope.endAngle)
			? 360 - (scope.startAngle - scope.endAngle) : theta = scope.endAngle - scope.startAngle;
		
		// Calculate start angle in radians
		var arcStartRadian = scope.startAngle * radian;
		
		if (size.measuredWidth < size.measuredHeight) {
			radius = vizuly2.util.getRelativeWidth(scope.radius, scope.selection.node());
		}
		else {
			radius = vizuly2.util.getRelativeHeight(scope.radius, scope.selection.node());
		}
		
		// Determine how many arcs we need
		var arcsTotal = Math.floor(scope.data / (scope.max - scope.min)) + 1;
		// Calculate arc thickness (if we have too many arcs for a given radius we reduce the thickness)
		var arcThickness = Math.min(radius * scope.arcThickness, radius * 0.75 / arcsTotal);
		
		// Reset our arcs array to add new arcs for each measure cycle
		arcs = [];
		
		// Create custom arc objects that hold arc properties and the d3.svg.arc path generator
		for (var i = 0; i < arcsTotal; i++) {
			var o = {};
			var arc = d3.arc();
			arc.outerRadius(radius - (arcThickness * i));
			arc.innerRadius(radius - (arcThickness * (i + 1)));
			arc.cornerRadius(arcThickness * scope.capRadius / 2);
			o.arc = arc;
			o.startAngle = arcStartRadian;
			
			//Determine how far the arc extends within theta (if we only have a partial arc, we need to calculate that  here)
			var spread = scope.data / (scope.max - scope.min) - i;
			o.endAngle = (spread > 1) ? theta * radian + arcStartRadian : (spread * theta) * radian + arcStartRadian;
			o.transitionEndAngle = o.endAngle; //Used for tweened transition
			
			arcs.push(o);
		}
		
		// This sets the properties of the d3.svg.arc that generates the background arc track
		arcTrack.outerRadius(radius)
		 .cornerRadius(arcThickness * scope.capRadius / 2)
		 .innerRadius(radius - arcThickness * arcs.length)
		 .startAngle(scope.startAngle * radian).endAngle((scope.startAngle + theta) * radian);
		
		size.radius = radius;
		
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
		scope.selection.style('width', size.measuredWidth + 'px').style('height', size.measuredHeight + 'px')
		svg.attr('width', size.measuredWidth).attr('height', size.measuredHeight);
		background.attr('width', size.measuredWidth).attr('height', size.measuredHeight);
		plot.style('width', size.width).style('height', size.height).attr('transform', 'translate(' + size.left + ',' + size.top + ')');
		arcPlot.attr('transform', 'translate(' + size.width / 2 + ',' + size.height / 2 + ')');
		
		backCircle.attr('r', radius);
		
		// Create our background track if one is not present.
		var trackPath = plot.selectAll('.vz-radial_progress-track');
		if (trackPath.nodes().length == 0) {
			trackPath = arcPlot.append('path').attr('class', 'vz-radial_progress-track');
		}
		trackPath.attr('d', arcTrack);
		
		// Create our label using the select, enter, exit pattern
		var label = labelPlot.selectAll('.vz-radial_progress-value-label').data([scope.data]);
		label.enter().append('text').attr('class', 'vz-radial_progress-value-label').style('text-anchor', 'middle');
		label.exit().remove();
		
		label = labelPlot.selectAll('.vz-radial_progress-value-label');
		
		label
		 .attr('x', size.width / 2)
		 .attr('y', size.height / 2)
		 .text(function (d) {
			 return scope.valueLabel(d)
		 });
		
		labelPlot.selectAll('.vz-radial_progress-top-label').remove();
		labelPlot.append('text')
		 .attr('class','vz-radial_progress-top-label')
		 .attr('x', size.width / 2)
		 .attr('y', size.height * .35)
		 .style('text-anchor','middle')
		 .text(function (d) {
			 return scope.topLabel(scope.data)
		 });
		
		labelPlot.selectAll('.vz-radial_progress-bottom-label').remove();
		labelPlot.append('text')
		 .attr('class','vz-radial_progress-bottom-label')
		 .attr('x', size.width / 2)
		 .attr('y', size.height * .6)
		 .style('text-anchor','middle')
		 .text(function (d) {
			 return scope.bottomLabel(scope.data)
		 });
		
		
		// Create each arc path using the select, enter, exit pattern
		var arcPath = arcPlot.selectAll('.vz-radial_progress-arc').data(arcs);
		arcPath.enter()
		 .append('path')
		 .attr('class', 'vz-radial_progress-arc');
		arcPath.exit().remove();
		
		// Use a transition to animate the arc.  If the duration is set to '0' there will be no animation
		
		arcPath = arcPlot.selectAll('.vz-radial_progress-arc')
		
		
		arcPath.transition('arcTransition')
		 .duration(scope.duration)
		 .attrTween('d', function (d) {
			 var node = this, i = d3.interpolate(d.startAngle, d.transitionEndAngle);
			 return function (t) {
				 d.endAngle = i(t);
				 scope.dispatch.apply('tween', viz, [t]);
				 var path = d.arc(d);
				 return path;
			 };
		 })
		 .on('interrupt', function () {
			 console.log('transition interrupted')
		 })
		 .on('end', function () {
			 console.log('transition ended')
		 });
		
		
		// Let everyone know we are doing doing our update
		scope.dispatch.apply('updated', viz);
	}
	
	
	/**
	 *  Triggers the render pipeline process to refresh the component on the screen.
	 *  @method  vizuly2.viz.RadialProgress.update
	 */
	viz.update = function () {
		update();
		return viz;
	};
	
	// styles and styles
	var stylesCallbacks = [
		{on: 'updated.styles', callback: applyStyles},
		{on: 'mouseover.styles', callback: styles_onMouseOver},
		{on: 'mouseout.styles', callback: styles_onMouseOut},
		{on: 'tween.styles', callback: styles_onTween}
	];
	
	viz.applyCallbacks(stylesCallbacks);
	
	//The <code>applystyles()</code> function is **the heart** of our styles.  This function is triggered on any
	//<code>viz.update()</code> event and is responsible for making all of the primary visual updates to the viz.
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		// Grab the d3.**selection** from the viz so we can operate on it.
		var selection = scope.selection;
		
		var styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-color-bottom'), viz.getStyle('background-color-top'));
		
		// Update the background
		selection.selectAll('.vz-background').style('fill', function () {
			 return 'url(#' + styles_backgroundGradient.attr('id') + ')';
		 })
		 .style('opacity', viz.getStyle('background-opacity'));
		
		selection.selectAll('.vz-radial_progress-back-circle').style('fill', viz.getStyle('radial-fill', []))
		
		// Style our **progress** arcs
		selection.selectAll('.vz-radial_progress-arc')
		 .style('fill', function (d, i) {
			 return viz.getStyle('progress-fill', arguments)
		 })
		 .style('fill-opacity', function (d, i) {
			 return viz.getStyle('progress-fill-opacity', arguments)
		 })
		 .style('stroke', function (d, i) {
			 return viz.getStyle('progress-stroke', arguments)
		 })
		 .style('shape-rendering', 'auto')
		
		// Style the **track** arcs
		selection.selectAll('.vz-radial_progress-track')
		 .style('fill', function () {
			 return viz.getStyle('track-fill')
		 })
		 .style('opacity', function () {
			 return viz.getStyle('track-opacity')
		 })
		 .style('shape-rendering', 'auto')
		
		// Style the **label**
		selection.selectAll('.vz-radial_progress-value-label')
		 .style('fill', function () {
			 return viz.getStyle('value-label-color')
		 })
		 .style('fill-opacity', function () {
			 return viz.getStyle('value-label-fill-opacity')
		 })
		 .style('stroke-opacity', 0)
		 .style('font-size', function (d, i) {
			 return viz.getStyle('value-label-font-size') + 'px'
		 });
		
		selection.selectAll('.vz-radial_progress-top-label')
		 .style('fill', function () {
			 return viz.getStyle('top-label-color')
		 })
		 .style('fill-opacity', function () {
			 return viz.getStyle('top-label-fill-opacity')
		 })
		 .style('stroke-opacity', 0)
		 .style('font-size', function (d, i) {
			 return viz.getStyle('top-label-font-size') + 'px'
		 });
		
		
		selection.selectAll('.vz-radial_progress-bottom-label')
		 .style('fill', function () {
			 return viz.getStyle('bottom-label-color')
		 })
		 .style('fill-opacity', function () {
			 return viz.getStyle('bottom-label-fill-opacity')
		 })
		 .style('stroke-opacity', 0)
		 .style('font-size', function (d, i) {
			 return viz.getStyle('bottom-label-font-size') + 'px'
		 });
		
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	//Now we get to some user triggered display changes.
	//For the gauge we simply change the font-weight of the label when a **mouseover** event occurs.
	function styles_onMouseOver(e, d, i) {
		scope.selection.selectAll('.vz-radial_progress-value-label')
		 .style('font-weight', 700);
	}
	
	//On **mouseout** we want to undo any changes we made on the mouseover callback.
	function styles_onMouseOut(e, d, i) {
		scope.selection.selectAll('.vz-radial_progress-value-label')
		 .style('font-weight', null);
	}
	
	function styles_onTween(i) {
		scope.selection.selectAll(".vz-radial_progress-value-label")
		 .text(scope.valueLabel(scope.data * i));
		
		scope.selection.selectAll(".vz-radial_progress-top-label")
		 .text(scope.topLabel(scope.data * i));
		
		scope.selection.selectAll(".vz-radial_progress-bottom-label")
		 .text(scope.bottomLabel(scope.data * i));
	}
	
	
	// Returns generated viz component
	return viz;
	
};