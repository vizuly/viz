/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.

 MIT LICENSE:

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 documentation files (the 'Software'), to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
 */

// @version 2.1.45

//
// This is the base component for a vizuly2.radial progress component.
//
vizuly2.viz.RadialProgress = function (parent) {

	// This is the object that provides pseudo 'protected' properties that the vizuly2.viz function helps create
	var scope = {};
	
	var d3 = vizuly2.d3;

	var properties = {
		'data': null,              // Expects a single numeric value
		'margin': {                // Our marign object
			'top': '10%',           // Top margin
			'bottom': '7%',        // Bottom margin
			'left': '8%',          // Left margin
			'right': '7%'          // Right margin
		},
		'duration': 500,            // This the time in ms used for any component generated transitions
		'width': 300,               // Overall width of component
		'height': 300,              // Height of component
		'radius': 150,             // Radius of the progress tracks
		'min': 0,                  // Min value of the domain
		'max': 1,                  // Max value of the domain
		'label': function (d, i)    // Default function used to render center label
		{
			return d;
		},
		'capRadius': 0,            // Percent to use for corner radius at end of arc  (0-1)
		'startAngle': 180,         // Start angle for layout range
		'endAngle': 180,           // End angle for layout range
		'arcThickness': 0.05       // Determines each arc width as percentage value of radius
	};
	
	var styles = {
		'background-fill' : 'none',
		'radial-fill' : 'none',
		'label-color': '#EEE',
		'track-fill': '#DDDDDD',
		'progress-fill': function (d, i) {
			var color = d3.scaleOrdinal(d3.schemeCategory10)(i);
			return color;
		},
		'progress-fill-opacity': function (d, i) {
			return 1;
		},
		'progress-stroke': function (d, i) {
			var color = d3.scaleOrdinal(d3.schemeCategory10)(i);
			return color;
		},
		'label-font-size' : function (d,i) {
			return this.radius() * .25 + 'px';
		}
	}

	//Measurements
	var size;                   // Holds the 'size' variable as defined in viz.util.size()
	var theta;                  // Calculated from start and end angle
	var radian = Math.PI / 180;   // radian constant
	var arcs = [];                // Holds array of arc objects based on the data value in respect to the min/max values

	//These are all d3.selection objects we use to insert and update svg elements into
	var svg, g, background, plot, plotBackground, arcPlot, labelPlot, backCircle, defs;

	// This is used to generate the arc path for the background track
	var arcTrack = d3.arc();

	//Create our viz and type it
	var viz = vizuly2.core.component(parent, scope, properties, ['tween']);
	viz.type = 'viz.chart.radial_progress';

	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		viz.defaultStyles(styles);
		
		scope.selection.style('margin','0px auto');
		svg = scope.selection.append('svg').attr('id', scope.id).style('overflow', 'visible').attr('class', 'vizuly').style('margin','0px auto');
		defs = vizuly2.core.util.getDefs(viz);
		background = svg.append('rect').attr('class', 'vz-background');
		g = svg.append('g').attr('class', 'vz-radial_progress-viz');
		plot = g.append('g').attr('class', 'vz-radial_progress-plot');
		plotBackground = plot.append('rect').attr('class', 'vz-plot-background');
		arcPlot = plot.append('g').attr('class', 'vz-radial_progress-arc-plot');
		labelPlot = plot.append('g').attr('class', 'vz-radial_progress-label-plot');
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
		scope.dispatch.apply('initialize', viz)
	}

	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {

		// Call our validate routine and make sure all component properties have been set
		viz.validate();

		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height);

		// Set our theta bases on start and end angles
		theta = (scope.startAngle == scope.endAngle)
			? 360 : (scope.startAngle > scope.endAngle)
				? 360 - (scope.startAngle - scope.endAngle) : theta = scope.endAngle - scope.startAngle;

		// Calculate start angle in radians
		var arcStartRadian = scope.startAngle * radian;

		// Determine how many arcs we need
		var arcsTotal = Math.floor(scope.data / (scope.max - scope.min)) + 1;
		// Calculate arc thickness (if we have too many arcs for a given radius we reduce the thickness)
		var arcThickness = Math.min(scope.radius * scope.arcThickness, scope.radius * 0.75 / arcsTotal);

		// Reset our arcs array to add new arcs for each measure cycle
		arcs = [];

		// Create custom arc objects that hold arc properties and the d3.svg.arc path generator
		for (var i = 0; i < arcsTotal; i++) {
			var o = {};
			var arc = d3.arc();
			arc.outerRadius(scope.radius - (arcThickness * i));
			arc.innerRadius(scope.radius - (arcThickness * (i + 1)));
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
		arcTrack.outerRadius(scope.radius)
			.cornerRadius(arcThickness * scope.capRadius / 2)
			.innerRadius(scope.radius - arcThickness * arcs.length)
			.startAngle(scope.startAngle * radian).endAngle((scope.startAngle + theta) * radian);

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
		scope.selection.style('width',scope.width + 'px').style('height',scope.height + 'px')
		svg.attr('width', scope.width).attr('height', scope.height);
		background.attr('width', scope.width).attr('height', scope.height);
		plot.style('width', size.width).style('height', size.height).attr('transform', 'translate(' + size.left + ',' + size.top + ')');
		arcPlot.attr('transform', 'translate(' + size.width / 2 + ',' + size.height / 2 + ')');

		backCircle.attr('r', scope.radius);

		// Create our background track if one is not present.
		var trackPath = plot.selectAll('.vz-radial_progress-track');
		if (trackPath.nodes().length == 0) {
			trackPath = arcPlot.append('path').attr('class', 'vz-radial_progress-track');
		}
		trackPath.attr('d', arcTrack);

		// Create our label using the select, enter, exit pattern
		var label = labelPlot.selectAll('.vz-radial_progress-label').data([scope.data]);
		label.enter().append('text').attr('class', 'vz-radial_progress-label').style('text-anchor', 'middle');
		label.exit().remove();

		label = labelPlot.selectAll('.vz-radial_progress-label');

		label.attr('x', size.width / 2)
			.attr('y', size.height / 2)
			.text(function (d, i) {
				return scope.label(d, i)
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
			.on('interrupt',function() { console.log ('transition interrupted')})
			.on('end',function() { console.log ('transition ended')});

		
		// Let everyone know we are doing doing our update
		scope.dispatch.apply('update', viz);
	}


	// This is our public update call that all viz components implement
	viz.update = function () {
		update();
		return viz;
	};

	// styles and styles
	var stylesCallbacks = [
		{on: 'update.styles',callback: applyStyles},
		{on: 'mouseover.styles',callback: styles_onMouseOver},
		{on: 'mouseout.styles',callback: styles_onMouseOut}
	];

	viz.applyCallbacks(stylesCallbacks);

	//The <code>applystyles()</code> function is **the heart** of our styles.  This function is triggered on any
	//<code>viz.update()</code> event and is responsible for making all of the primary visual updates to the viz.
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;

		// Grab the d3.**selection** from the viz so we can operate on it.
		var selection = scope.selection;
		
		background.style('fill',viz.getStyle('background-fill',[]))
		
		selection.selectAll('.vz-radial_progress-back-circle').style('fill',viz.getStyle('radial-fill',[]))

		// Style our **progress** arcs
		selection.selectAll('.vz-radial_progress-arc')
			.style('fill',function (d,i) { return viz.getStyle('progress-fill',arguments) })
			.style('fill-opacity',function (d,i) { return viz.getStyle('progress-fill-opacity',arguments) })
			.style('stroke',function (d,i) { return viz.getStyle('progress-stroke',arguments) });

		// Style the **track** arcs
		selection.selectAll('.vz-radial_progress-track')
			.style('fill',function () { return viz.getStyle('track-fill') });

		// Style the **label**
		selection.selectAll('.vz-radial_progress-label')
			.style('fill',function () { return viz.getStyle('label-color') })
			.style('stroke-opacity',0)
			.style('font-size',function (d,i) { return viz.getStyle('label-font-size')});  // Notice we dynamically size the font based on the gauge radius.
		
		scope.dispatch.apply('styled', viz);

	}

	//Now we get to some user triggered display changes.
	//For the gauge we simply change the font-weight of the label when a **mouseover** event occurs.
	function styles_onMouseOver(e,d,i) {
		scope.selection.selectAll('.vz-radial_progress-label')
			.style('font-weight',700);
	}

	//On **mouseout** we want to undo any changes we made on the mouseover callback.
	function styles_onMouseOut(e,d,i) {
		scope.selection.selectAll('.vz-radial_progress-label')
			.style('font-weight',null);
	}

	/*
	
	// This is how you set skins to work with the component skin
	viz.skins({
		Alert: {
			name: 'Alert',                            // Skin Name
			'label-color': '#CCC',                    // Color of the center label
			'track-fill': '#DDDDDD',                  // Color of the background 'track' of the progress bar
			    // Colors used for progress bar
			'progress-fill': function (d, i) {
				return this['progress-colors'][i % 5]; // Dynamic function that returns a fill based on the index value
			},
			'progress-fill-opacity': function (d, i) {
				return 1;                           // Dynamic function that returns opacity (in this case it is 1, but the WHITE skin uses a dynamic opacity
			},
			'progress-stroke': function (d, i) {
				return this['progress-colors'][i % 5]; // Dynamic function that returns stroke color based on index
			},
			'label-font-size' : function (d,i) {
				return viz.radius() * .25 + 'px';
			},
			// Each skin can also have a **CSS class** with styles that don't need to be changed dynamically by the skin directly.
			class: 'vz-skin-alert'                  // CSS Class that it will apply to the viz object output.
		},
		Fire: {
			name: 'Fire',
			'label-color': '#F13870',
			'track-fill': '#DDDDDD',
			'progress-colors': ['#C50A0A', '#F57C00', '#FF9800', '#FFEB3B', '#C2185B'],
			'progress-fill': function (d, i) {
				return this['progress-colors'][i % 5];
			},
			'progress-fill-opacity': function (d, i) {
				return 1;
			},
			'progress-stroke': function (d, i) {
				return this['progress-colors'][i % 5];
			},
			'label-font-size' : function (d,i) {
				return viz.radius() * .25 + 'px';
			},
			class: 'vz-skin-fire'
		},
		White: {
			name: 'White',
			'label-color': '#FFF',
			'track-fill': null,
			'progress-fill': function (d, i) {
				return '#FFF';
			},
			'progress-fill-opacity': function (d, i) {
				return .85 / Math.exp(i * .75);
			},
			'progress-stroke': function (d, i) {
				return '#FFF';
			},
			'label-font-size' : function (d,i) {
				return viz.radius() * .25 + 'px';
			},
			class: 'vz-skin-white'
		},
		Neon: {
			name: 'Neon',
			'label-color': '#D1F704',
			'track-fill': '#000',
			'progress-colors': ['#D1F704', '#A8C102', '#788A04', '#566204', '#383F04'],
			'progress-fill': function (d, i) {
				return this['progress-colors'][i % 5];
			},
			'progress-fill-opacity': function (d, i) {
				return 1;
			},
			'progress-stroke': function (d, i) {
				return this['progress-colors'][i % 5];
			},
			'label-font-size' : function (d,i) {
				return viz.radius() * .25 + 'px';
			},
			class: 'vz-skin-neon'
		},
		default: {
			name: 'Business',
			'label-color': '#EEE',
			'track-fill': '#DDDDDD',
			'progressfill': function (d, i) {
				return d3.scaleOrdinal(d3.schemeCategory10)(i);
			},
			'progress-fill-opacity': function (d, i) {
				return 1;
			},
			'progress-stroke': function (d, i) {
				return this['progress-colors'](i);
			},
			'label-font-size' : function (d,i) {
				return viz.radius() * .25 + 'px';
			},
			class: 'vz-skin-business'
		}
	})
*/
	
	initialize();

	// Returns generated viz component
	return viz;

};