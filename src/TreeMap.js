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
// This is the base component for a vizuly2.bar chart.
//
vizuly2.viz.TreeMap = function (parent) {
	
	// This is the object that provides pseudo "protected" properties that the vizuly2.viz function helps create
	var scope = {};
	
	var d3 = vizuly2.d3;
	
	var properties = {
		'data': null,
		'margin': {                            // Our margin object
			'top': 0,                       // Top margin
			'bottom': 0,                    // Bottom margin
			'left': 0,                      // Left margin
			'right': 0                      // Right margin
		},
		'width': 300,                          // Overall width of component
		'height': 300,                         // Height of component
		'duration': 1500,                        // duration of transition
		'value': function (d) { return d.size },
		'key': function (d) { return d.key },
		'label': function (d) { return d.label },
		'children': function (d) { return d.children },
		'dataTipRenderer' : dataTipRenderer
	};
	
	var styles = {
		'background-gradient-top': '#EEE',
		'background-gradient-bottom': '#CCC',
		'cell-corner-radius': function (e, d, i) {
			return Math.min((d.x1 - d.x0), (d.y1 - d.y0)) * .05
		},
		'cell-padding': function (d) { return 0 },
		'cell-font-size': function (e, d, i) {
			return Math.max(10, Math.min((d.x1 - d.x0), (d.y1 - d.y0)) * .15)
		},
		'cell-font-color': '#000',
		'cell-fill': function (e, d, i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			color = colors[i % colors.length]
			var color1 = vizuly2.core.util.rgbToHex(d3.rgb(color));
			var color2 = vizuly2.core.util.rgbToHex(d3.rgb(color).darker(.5));
			return 'url(#' + vizuly2.svg.gradient.blend(viz, color2, color1).attr('id') + ')';
		},
		'cell-fill-opacity': .5
	}
	
	// Create our viz and type it
	var viz = vizuly2.core.component(parent, scope, properties);
	
	var size;           // Holds the 'size' variable as defined in viz.util.size()
	
	// These are all d3.selection objects we use to insert and update svg elements into
	var svg, plot, background, defs;
	
	var treemap = d3.treemap();
	
	var root;
	
	console.log('TODO: temp vars')
	var fader = function(color) { return d3.interpolateRgb(color, "#fff")(0.2); },
	 color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
	 format = d3.format(",d");
	
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		viz.defaultStyles(styles);
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.core.util.getDefs(viz);
		plot = svg.append('g');
		
		scope.dispatch.apply('initialize', viz);
	}
	
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		
		root = d3.hierarchy(scope.data, scope.children)
		 .eachBefore(function(d) { d.id = (d.parent ? d.parent.id + "." : "") + scope.key(d.data); })
		 .sum(scope.value)
		 .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
		
		treemap.tile(d3.treemapResquarify)
		 .size([size.width, size.height])
		 .round(true)
		 .paddingInner(viz.style('cell-padding'));
		
		treemap(root);
		
		// Tell everyone we are done making our measurements
		scope.dispatch.apply('measure', viz);
		
	}
	
	// The update function is the primary function that is called when we want to render the visualiation based on
	// all of its set properties.  A developer can change propertys of the components and it will not show on the screen
	// until the update function is called
	function update() {
		
		// Call measure each time before we update to make sure all our our layout properties are set correctly
		measure();
		
		// Layout all of our primary SVG d3.elements.
		svg.attr('width', size.measuredWidth).attr('height', size.measuredHeight);
		background.attr('width', size.measuredWidth).attr('height', size.measuredHeight);
		plot.attr('transform', 'translate(' + size.left + ',' + size.top + ')');
		
		var cellOffset = 5;
		
		//plot.selectAll('.vz-treemap-cell-group').remove();
		
		var cell = plot.selectAll('.vz-treemap-cell-group')
		 .data(root.leaves(), function (d, i) { return d.id });
		
		cell.exit().remove();
		
		var cellEnter = cell.enter().append('g')
		 .attr('class', 'vz-treemap-cell-group')
		 .attr('transform', function(d) {return 'translate(' + d.x0 + ',' + d.y0 + ')'; });
		
		cellEnter.append('rect')
		 .attr('class','vz-treemap-cell-rect')
		 .attr('id', function(d) { return d.id; })
		
		cellEnter.append('text')
		 .attr('class','vz-treemap-cell-label')
		
		cell = cellEnter.merge(cell);
		
		cell.each(function (d) {
			var g = d3.select(this);
			
			g.selectAll('.vz-treemap-cell-rect').datum(d)
			 .attr('width', function(d) { return d.x1 - d.x0; })
			 .attr('height', function(d) { return d.y1 - d.y0; })
			
			var label =	g.selectAll('.vz-treemap-cell-label')
			 .datum(d)
			 .text(function (d) { return scope.label(d.data)})
			
			vizuly2.svg.text.wrap(label, scope.label(d.data), d.x1 - d.x0, viz.getStyle('cell-font-size',[this, d]));
			
			g.selectAll('.vz-treemap-cell-label')
			 .attr('display',function (d) {
				 var bounds = this.getBoundingClientRect();
				 return (bounds.width < (d.x1 - d.x0) && bounds.height < (d.y1 - d.y0)) ? 'block' : 'none';
			 })
			
			/*
			 
			 g.selectAll('.vz-treemap-cell-label').datum(d)
			 .selectAll('tspan')
			 .remove();
			 
			 g.selectAll('.vz-treemap-cell-label').selectAll('tspan')
			 .data(function() { return scope.label(d.data).split(/(?=[A-Z][^A-Z])/g); })
			 .enter().append('tspan')
			 .attr('x', 4)
			 .attr('y', function(d, i) { return 13 + i * 10; })
			 .text(function(d) { return d; });
			 
			 
			 g.selectAll('.vz-treemap-cell-label')
			 .attr('display',function (d) {
			 var bounds = this.getBoundingClientRect();
			 return (bounds.width < (d.x1 - d.x0) && bounds.height < (d.y1 - d.y0)) ? 'block' : 'none';
			 })
			 
			 */
			
		})
		
		
		cell
		 .transition().duration(scope.duration)
		 .attr('transform', function(d) { return 'translate(' + d.x0 + ',' + d.y0 + ')'; });
		
		scope.dispatch.apply('update', viz);
		
	}
	
	// This is our public update call that all vizuly2.viz's implement
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
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		// Grab the d3.selection from the viz so we can operate on it.
		var selection = scope.selection;
		
		styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-gradient-bottom'), viz.getStyle('background-gradient-top'));
		
		// Update the background
		selection.selectAll(".vz-background").style("fill", function () {
			return "url(#" + styles_backgroundGradient.attr("id") + ")";
		});
		
		plot.selectAll('.vz-treemap-cell-rect')
		 .attr('rx', function (d,i) { return viz.getStyle('cell-corner-radius',[this, d])})
		 .attr('ry', function (d,i) { return viz.getStyle('cell-corner-radius',[this, d])})
		 .style('fill', function (d,i) { return viz.getStyle('cell-fill',[this, d, i])})
		 .style('opacity', function (d,i) { return viz.getStyle('cell-fill-opacity',[this, d, i])})
		
		plot.selectAll('.vz-treemap-cell-label')
		 .attr('font-size',function (d,i) { return viz.getStyle('cell-font-size', [this, d, i]) + 'px'})
		 .style('fill',function (d,i) { return viz.getStyle('cell-font-color', [this, d, i])})
		 .each(function (d) {
			 var fontSize = viz.getStyle('cell-font-size',[this, d]);
			 // d3.select(this).selectAll('tspan')
			 //  .attr('y', function (d,i) { return fontSize + i * fontSize })
		 })
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	
	function styles_onMouseOver(e,d,i) {
	
	}
	
	function styles_onMouseOut(e,d,i) {
	
	}
	
	function dataTipRenderer(tip, e, d, i, x, y) {
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header3" style="font-size:12px;"> HEADER3 </div>';
		
		var h1 = 'Tip Label 1';
		var h2 = 'Tip Label 2';
		var h3 = 'Tip Label 3';
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		html = html.replace("HEADER3", h3);
		
		tip.style('height','80px').html(html);
		
		console.log((Number(x) + Number(d3.select(e).attr('width'))));
		
		return [(Number(x) + Number(d3.select(e).attr('width'))),y - 50]
		
	}
	
	
	initialize();
	
	// Returns our viz component :)
	return viz;
}