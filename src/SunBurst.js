/*
 Starting point for a vizuly2.core.component
 
 // @version 2.1.45
 
 */
vizuly2.viz.Sunburst = function (parent) {
	
	// This is the object that provides pseudo "protected" properties that the vizuly2.viz function helps create
	var scope = {};
	
	var d3 = vizuly2.d3;
	
	var properties = {
		"data": null,              	// nested hierarchy of objects
		"margin": {                	// Our marign object
			"top": "10%",           	// Top margin
			"bottom": "7%",        		// Bottom margin
			"left": "8%",          		// Left margin
			"right": "7%"          		// Right margin
		},
		"duration": 750,            // This the time in ms used for any component generated transitions
		"width": 300,               // Overall width of component
		"height": 300,              // Height of component
		"children": function (d) {	// Child accessor function for nest
			return d.values
		},
		"value": function (d) {			// Accessor for value used to calculate arc segment
			return d.value
		},
		"key": function (d) {				// Accessor used for unique key in nest
			return d.key
		},
		"label": function (d) {			// Accessor used for arc segment label
			return d.label
		},
		"dataTipRenderer": dataTipRenderer
	};
	
	var styles = {
		'background-gradient-top': "#FFF",
		'background-gradient-bottom': "#e2e2e2",
		'fill-colors': ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'],
		'stroke': function (d, i) {
			if (d == root) return "#FFF";
			var colors = this.getStyle('fill-colors');
			var c = d3.rgb(colors[(d.data.rootIndex ? d.data.rootIndex : 0) % colors.length]);
			return c.darker((d.depth) / (maxDepth * .75))
		},
		'stroke-opacity': 0.9,
		'fill': function (d, i) {
			if (d == root) return "#FFF";
			var colors = this.getStyle('fill-colors');
			var c = d3.rgb(colors[(d.data.rootIndex ? d.data.rootIndex : 0) % colors.length]);
			return c.darker((d.depth - 1) / maxDepth)
		},
		'fill-highlight': function (d, i) {
			if (d == root) return "#FFF";
			var colors = this.getStyle('fill-colors');
			var c = d3.rgb(colors[(d.data.rootIndex ? d.data.rootIndex : 0) % colors.length]);
			return c.brighter((d.depth) / maxDepth)
		}
	};
		
		//Create our viz and type it
		var viz = vizuly2.core.component(parent, scope, properties);
	
	//Measurements
	var size;                   // Holds the 'size' variable as defined in viz.util.size()
	var radius;
	
	//These are all d3.selection objects we use to insert and update svg elements into
	var svg, g, background, plot, plotBackground, defs, drillUp;
	
	var x = d3.scaleLinear()
	 .range([0, 2 * Math.PI]);
	
	var y = d3.scaleSqrt()
	
	var partition = d3.partition();
	var root;
	var nodes;
	var maxDepth;
	
	var arc = d3.arc()
	 .startAngle(function (d) {
		 return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
	 })
	 .endAngle(function (d) {
		 return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
	 })
	 .innerRadius(function (d) {
		 return Math.max(0, y(d.y0));
	 })
	 .outerRadius(function (d) {
		 return Math.max(0, y(d.y1));
	 });
	
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  They all are referenced as d3.selections.
	function initialize() {
		
		viz.defaultStyles(styles)
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		defs = vizuly2.core.util.getDefs(viz);
		background = svg.append("rect").attr("class", "vz-background");
		g = svg.append("g").attr("class", "vz-sunburst");
		plot = g.append("g").attr("class", "vz-sunburst-plot");
		plotBackground = plot.append("rect").attr("class", "vz-plot-background");
		drillUp = g.append('g').attr('class','.vz-sunburst-drill-up').append('path').attr('d','M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4zM5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5zm14-2h-4v2h4v4h2V5c0-1.1-.9-2-2-2zm0 16h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4zM12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z')
		 .style('pointer-events','none')
		 .style('opacity',0)
		
		// Tell everyone we are done initializing
		scope.dispatch.apply('initialize', viz);
	}

	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height);
		
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
		
		y.range([0, radius]).domain([0,1]);
		
		
		// Tell everyone we are done making our measurements
		scope.dispatch.apply('measure', viz);
		
	}
	
	// The update function is the primary function that is called when we want to render the visualization based on
	// all of its set properties.  A developer can change properties of the components and it will not show on the screen
	// until the update function is called
	function update() {
		
		// Call measure each time before we update to make sure all our our layout properties are set correctly
		measure();
		
		// Layout all of our primary SVG d3.elements.
		svg.attr("width", scope.width).attr("height", scope.height);
		background.attr("width", scope.width).attr("height", scope.height);
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
		
		
		paths.transition().duration(scope.duration)
		 .tween("scale", function (d) {
			 var xd = d3.interpolate([0, 10], [0, 1]),
				yd = d3.interpolate(y.domain(), [d.y0, 1]),
				yr = d3.interpolate([0, 1], [0, radius]);
			 return function (t) {
				 x.domain(xd(t));
				 y.range(yr(t));
			 };
		 })
		 .attrTween("d", function (d) {
			 return function () {
				 return arc(d);
			 };
		 });
		
		drillUp.attr('transform','translate(' + (size.left + radius - 12) + ',' + (size.top + radius - 12) + ')')
			.style('opacity',0);
		
		// Let everyone know we are doing doing our update
		// Typically themes will attach a callback to this event so they can apply styles to the elements
		scope.dispatch.apply('update', viz);
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
		plot.transition()
		 .duration(750)
		 .tween("scale", function () {
			 var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
				yd = d3.interpolate(y.domain(), [d.y0, 1]),
				yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
			 return function (t) {
				 x.domain(xd(t));
				 y.domain(yd(t)).range(yr(t));
			 };
		 })
		 .selectAll(".vz-sunburst-arc")
		 .attrTween("d", function (d) {
			 return function () {
				 return arc(d);
			 };
		 });
		
		scope.dispatch.apply('click', viz, [this, d.data, i, d])
	}
	
	// This is our public update call that all viz components implement
	viz.update = function () {
		update();
		return viz;
	};
	
	var styles_backgroundGradient;
	
	// styles and styles
	var stylesCallbacks = [
		{on: 'update.styles', callback: applyStyles},
		{on: 'mouseover.styles', callback: styles_onMouseOver},
		{on: 'mouseout.styles', callback: styles_onMouseOut}
	];
	
	viz.applyCallbacks(stylesCallbacks);
	
	function styles_onMouseOver(path, d, i, datum) {
		d3.select(path).style('fill', function (d, i) {
			return viz.getStyle('fill-highlight', [d, i])
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
		
		styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-gradient-bottom'), viz.getStyle('background-gradient-top'));
		
		// Update the background
		scope.selection.selectAll(".vz-background").style("fill", function () {
			return "url(#" + styles_backgroundGradient.attr("id") + ")";
		});
		
		if (scope.styles['color-scale'])
			scope.styles['color-scale'].domain([0, scope.children(scope.data).length]);
		
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
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function dataTipRenderer(tip, e, d, i, x, y) {
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header3" style="font-size:12px;"> HEADER3 </div>';
		
		var h1 = scope.label(d.data);
		var h2 = scope.value(d.data);
		var h3 = "Level: " + d.depth;
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		html = html.replace("HEADER3", h3);
		
		tip.style('height','80px').html(html);
		
		return [(Number(x) + Number(d3.select(e).attr('width'))),y - 50]
		
	}
	
	initialize();
	
	// Returns our viz component :)
	return viz;
	
}