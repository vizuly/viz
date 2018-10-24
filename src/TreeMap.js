/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 This source code is covered under the following license: http://vizuly2.io/commercial-license/
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.24

//
// This is the base component for a vizuly2.bar chart.
//
vizuly2.viz.TreeMap = function (parent) {
	
	var d3 = vizuly2.d3;
	
	var properties = {
		'data': null,
		'margin': {                            // Our margin object
			'top': 10,                       // Top margin
			'bottom': 10,                    // Bottom margin
			'left': 10,                      // Left margin
			'right': 10                      // Right margin
		},
		'width': 300,                          // Overall width of component
		'height': 300,                         // Height of component
		'duration': 500,                        // duration of transition
		'value': function (d) { return d.size },
		'valueFormatter': function (d) { return d3.format(',')(d) },
		'key': function (d) { return d.key },
		'label': function (d) { return d.label },
		'groupLabel': function (d) { return d.label },
		'children': function (d) { return d.children },
		'dataTipRenderer' : dataTipRenderer
	};
	
	var styles = {
		'background-color-top': '#FFF',
		'background-color-bottom': '#DDD',
		'cell-corner-radius': function (e, d, i) {
			return Math.min((d.x1 - d.x0), (d.y1 - d.y0)) * .05
		},
		'cell-padding': function (d) { return  Math.max(0,5 - d.depth) },
		'cell-padding-top': function (d) { return (d.depth == 1) ? 20 : 0 },
		'cell-padding-inner': function (e, d,i) {
			return Math.round((d.x1-d.x0) * .03)},
		'cell-font-size': function (e, d, i) {
			return Math.max(9, Math.min(18,(d.x1 - d.x0) * .1))
		},
		'cell-label-color': '#FFF',
		'cell-label-opacity': 1,
		'cell-fill': function (e, d, i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			var color = colors[d.rootIndex % colors.length];
			var color1 = vizuly2.core.util.rgbToHex(d3.rgb(color));
			var color2 = vizuly2.core.util.rgbToHex(d3.rgb(color).darker(1));
			return 'url(#' + vizuly2.svg.gradient.blend(viz, color2, color1).attr('id') + ')';
		},
		'cell-stroke': 'none',
		'cell-stroke-width': 1,
		'cell-stroke-opacity':1,
		'cell-fill-opacity': .75,
		'header-font-size': 20,
		'header-label-color': function (d,i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return colors[d._rootIndex % colors.length];
		},
		'group-label-color': '#777'
	}
	
	var events = ['mouseover', 'mouseout', 'click'];
	
	// This is the object that provides pseudo "protected" properties that the vizuly.viz function helps create
	var scope = {};
	scope.initialize = initialize;
	scope.properties = properties;
	scope.styles = styles;
	scope.events = events;
	
	// Create our Vizuly component
	var viz = vizuly2.core.component(parent, scope);
	
	var size, headerHeight;           // Holds the 'size' variable as defined in viz.util.size()
	
	// These are all d3.selection objects we use to insert and update svg elements into
	var svg, plot, background, header, defs;
	
	var treemap = d3.treemap();
	
	var root, rootAncestors;
	
	var drillPath = [];
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.core.util.getDefs(viz);
		header = svg.append('g').attr('class','vz-treemap-header');
		plot = svg.append('g').attr('class','vz-treemap-plot');
	
		
		scope.dispatch.apply('initialized', viz);
	}
	
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure(treeData) {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		rootAncestors = [];
		scope.children(scope.data).forEach(function (d) {
			rootAncestors.push(scope.key(d));
		})
		
		root = d3.hierarchy(treeData, scope.children)
		 .eachBefore(function(d) {
		 	d.id = (d.parent ? d.parent.id + "_" : "") + vizuly2.core.util.createCSSKey(scope.key(d.data));
		 	if (d.depth > 0) {
		 		d.rootAncestor = d.parent.rootAncestor ? d.parent.rootAncestor : scope.key(d.data);
		 		d.rootIndex = rootAncestors.indexOf(d.rootAncestor);
		  }
		 })
		 .sum(scope.value)
		 .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
		
		if (treeData === scope.data) drillPath = [root.data];
		
		headerHeight = viz.getStyle('header-font-size') + viz.getStyle('cell-padding-top', [{'depth': 1}]);
		
		treemap
		 .tile(d3.treemapResquarify)
		 .size([size.width, size.height - headerHeight])
		 .round(true)
		 .paddingInner(viz.style('cell-padding'))
		 .paddingTop(viz.style('cell-padding-top'))
		
		treemap(root);
		
		scope.size = size;
		
		// Tell everyone we are done making our measurements
		scope.dispatch.apply('measured', viz);
		
	}
	
	// The update function is the primary function that is called when we want to render the visualiation based on
	// all of its set properties.  A developer can change propertys of the components and it will not show on the screen
	// until the update function is called
	function update(data) {
		
		var treeData = (data) ? data : scope.data;
		
		// Call measure each time before we update to make sure all our our layout properties are set correctly
		measure(treeData);
		
		// Layout all of our primary SVG d3.elements.
		svg.attr('width', size.measuredWidth).attr('height', size.measuredHeight);
		background.attr('width', size.measuredWidth).attr('height', size.measuredHeight);
		header.attr('transform', 'translate(' + size.left + ',' + (size.top) + ')');
		plot.attr('transform', 'translate(' + size.left + ',' + (size.top + headerHeight) + ')');
		
		var cellOffset = 5;
		
		//var cell = plot.selectAll('.vz-treemap-cell-group')
		// .data(root.leaves(), function (d, i) { return d.id });
		
		//Find out Max depth
		var maxDepth = d3.max(root.descendants(),function (d) { return d.depth });
		
		var depthToShow = (maxDepth > 1) ? 2 : 1;
		
		var renderData = root.descendants().filter(function (d) {
			return (d.depth == depthToShow)
	  })
		
		var cell = plot.selectAll('.vz-treemap-cell-group')
		 .data(renderData, function (d, i) { return d.id });
		
		cell.exit().remove();
		
	  var cellEnter = cell.enter().append('g')
		 .attr('class', function (d) { return 'vz-treemap-cell-group group_' + d.id.split('_')[1] })
		 .attr('transform', function(d) {return 'translate(' + d.x0 + ',' + d.y0 + ')'; })
	   .on('mouseover',function (d,i) { scope.dispatch.apply('mouseover',viz, [this, d, i])})
	   .on('mouseout',function (d,i) { scope.dispatch.apply('mouseout',viz, [this, d, i])})
	   .style('cursor',function (d) { return d.children ? 'pointer' : 'not-allowed'})
		
		cellEnter.append('rect')
		 .attr('class','vz-treemap-cell-rect')
		 .attr('id', function(d) { return d.id; })
		 .on('click',function (d,i) { scope.dispatch.apply('click',viz, [this, d, i])})
		
		cell = cellEnter.merge(cell);
	 
		cell.each(function (d,i) {
			var g = d3.select(this);
			
			g.selectAll('text').remove();
			
			g.selectAll('.vz-treemap-cell-rect').datum(d)
			 .attr('width', function (d) {
				 return d.x1 - d.x0;
			 })
			 .attr('height', function (d) {
				 return d.y1 - d.y0;
			 })
			
			var padding = viz.getStyle('cell-padding-inner', [this, d, i]);
			
			var fontSize = viz.getStyle('cell-font-size', [this, d, i]);
			var w = d.x1-d.x0;
			var h = d.y1-d.y0;
			
			if ((scope.label(d.data).length * fontSize)/(w) < h/fontSize  && h > fontSize*2 + padding) {
				
			//	if ((scope.label(d.data).split(/\s+/).length * fontSize) < h) {
				
				var label = g.append('text')
				 .datum(d)
				 .attr('class','vz-treemap-cell-label')
				 .attr('y',fontSize)
				 .attr('x',0)
				 .attr('dy', function (d, i) {
					 var ret = (viz.getStyle('cell-font-size', [this, d, i]) * 1.2) + 'px'
					 return ret
				 })
				 .style('opacity', function (d, i) {
					 return viz.getStyle('cell-label-opacity', [this, d, i])
				 })
				 .style('font-size', function (d, i) {
					 return fontSize + 'px'
				 })
				 .text(function (d) {
					 return scope.label(d.data)
				 })
				 .call(wrap, d.x1 - d.x0 - padding * 2)
				
			}
			
		})
		
		cell
		 .transition().duration(scope.duration)
		 .attr('transform', function(d) { return 'translate(' + d.x0 + ',' + d.y0 + ')'; });
		
		root.children.forEach(function (d,i) {
			var group = plot.select('.group_' + d.id.split('_')[1])
			group.selectAll('.vz-group-label').remove();
			
			if (d.children) {
				var labelText = scope.groupLabel(d.depth > 1 ? d.parent : d)
				
				var label = group.append('text')
				 .datum(d)
				 .attr('class','vz-group-label')
				 .attr('transform','translate(0,-5)')
				 .style('cursor','pointer')
				 .style('font-size',function (d,i) { return viz.getStyle('cell-font-size',[this, d, i]) + 'px'})
				 .text(labelText)
				 .on('click',function (d,i) { scope.dispatch.apply('click',viz, [this, d, i])})
				
				if (label.node()) {
					var labelWidthRatio = (d.x1-d.x0)/label.node().getComputedTextLength()
					if (labelWidthRatio < 1) {
						label.text(labelText.substr(0, Math.round(labelText.length * labelWidthRatio)-3) + '...');
					}
				}
			}
		})
		
		updateDrillPath();
		
		scope.dispatch.apply('updated', viz);
		
	}
	
	function wrap(selection, width) {
		selection.each(function() {
			var text = d3.select(this),
			 all = text.text(),
			 words = text.text().split(/\s+/).reverse(),
			 word,
			 line = [],
			 lineNumber = 0,
			 x = text.attr("x"),
			 dy = parseFloat(text.attr("dy")),
			 fontSize = parseFloat(text.style('font-size')),
			 y = text.attr("y"),
			 lineHeight = dy,
			 tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", "0px").style('font-size', fontSize + 'px')
			
			//text.attr("class","width_" + width);
			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width  && tspan.text().indexOf(' ') > 0) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan")
					 .attr("x", x)
					 .attr("y", y)
					 .attr("dy", (++lineNumber-1) * lineHeight + dy + "px")
					 .style('font-size', fontSize + 'px')
					 .text(word)
				}
			}
			//text.selectAll('tspan').attr("y",y)
		})
	};

	function updateDrillPath() {
		header.selectAll('.vz-drill-label').remove();
		
		/*
		var rootLabel = header.append('text')
		 .datum(scope.data)
		 .attr('font-size',function (d,i) { return viz.getStyle('header-font-size',arguments) + 'px'})
		 .text(scope.label(scope.data));
		*/
		
		var xOffset = 0; // rootLabel.node().getBoundingClientRect().width + viz.getStyle('header-font-size',arguments)/2;
		
		var drillLabels = header.selectAll('.vz-drill-label').data(drillPath);
		
		drillLabels.enter()
		 .append('text')
		 .attr('class','vz-drill-label')
		 .text(function (d,i) { return (i > 0 ? ' > ' : '') + scope.label(d)})
		 .attr('font-size',function (d,i) { return viz.getStyle('header-font-size',arguments) + 'px'})
		 .attr('x',function (d,i) {
		 	  var x = xOffset;
		 	  xOffset = xOffset + this.getComputedTextLength() + viz.getStyle('header-font-size',arguments)/2;
		 	  return x
		 })
		
		//Apply after we use select above so it doesn't get collected.
	//	rootLabel.attr('class','vz-drill-label')
		
		var headerWidthRatio = size.width/header.node().getBoundingClientRect().width;
		
		if (headerWidthRatio < 1) {
			xOffset = 0;
			var fontSize = Math.max(9, Math.round(viz.getStyle('header-font-size') * (headerWidthRatio - 0.05)));
			header.selectAll('.vz-drill-label')
			 .style('font-size', fontSize + 'px')
			 .attr('x',function (d,i) {
				 var x = xOffset;
				 xOffset = xOffset + this.getComputedTextLength() + viz.getStyle('header-font-size',arguments)/2;
				 return x
			 })
		}
		
		header.selectAll('.vz-drill-label')
		 .on('click', function (d,i) { if (i < drillPath.length) drillPath_onClick(d) })
		 .style('cursor', function (d,i) { return i < drillPath.length - 1 ? 'pointer' : 'auto' })
		 .style('pointer-events', function (d,i) { return i < drillPath.length - 1 ? 'auto' : 'none' })
		 .style('font-weight', function (d,i) { return i < drillPath.length - 1 ? 'bold' : 'normal' })
	}
	
	// This is our public update call that all vizuly2.viz's implement
	viz.update = function () {
		update();
		return viz;
	};
	
	var styles_backgroundGradient;
	
	// styles and styles
	var stylesCallbacks = [
		{on: 'updated.styles', callback: applyStyles},
		{on: 'mouseover.styles', callback: styles_onMouseOver},
		{on: 'mouseout.styles', callback: styles_onMouseOut},
		{on: 'click.styles', callback: styles_onClick}
	];
	
	viz.applyCallbacks(stylesCallbacks);
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		// Grab the d3.selection from the viz so we can operate on it.
		var selection = scope.selection;
		
		styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-color-bottom'), viz.getStyle('background-color-top'));
		
		// Update the background
		selection.selectAll(".vz-background").style("fill", function () {
			return "url(#" + styles_backgroundGradient.attr("id") + ")";
		});
		
		plot.selectAll('.vz-treemap-cell-rect')
		 .attr('vz', function (d,i) { return viz.getStyle('cell-corner-radius',[this, d])})
		 .attr('ry', function (d,i) { return viz.getStyle('cell-corner-radius',[this, d])})
		 .style('fill', function (d,i) { return viz.getStyle('cell-fill',[this, d, i])})
		 .style('opacity', function (d,i) { return viz.getStyle('cell-fill-opacity',[this, d, i] )})
		 .style('stroke', function (d,i) { return viz.getStyle('cell-stroke',[this, d, i])})
		 .style('stroke-width', function (d,i) { return viz.getStyle('cell-stroke-width',[this, d, i])})
		 .style('stroke-opacity', function (d,i) { return viz.getStyle('cell-stroke-opacity',[this, d, i])})
		
		
		plot.selectAll('.vz-treemap-cell-label')
		 .attr('transform', function (d,i) {
		 	  var padding =  viz.getStyle('cell-padding-inner', [this, d, i]);
		 	  return 'translate(' + padding + ',' + padding + ')'
		 })
		 .style('fill',function (d,i) { return viz.getStyle('cell-label-color', [this, d, i])})
		 .style('pointer-events','none')
		 .style('display',function (d,i) { return this.getBoundingClientRect().width * 0.9 > d.x1-d.x0 ? 'none' : 'block'})
		
		plot.selectAll('.vz-group-label')
		 .style('fill', function (d,i) { return viz.getStyle('group-label-color',[this, d, i])})
		
		header.selectAll('.vz-drill-label')
		 .attr('dy',function (d,i) { return viz.getStyle('header-font-size',arguments)})
		 .attr('fill',function (d,i) { return viz.getStyle('header-label-color',arguments)})
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function styles_onMouseOver(e,d,i) {
		if (d3.select(d3.event.target).attr('class') == 'vz-group-label') return;
		plot.selectAll('.vz-treemap-cell-group')
		 .transition('style_mouseover')
		 .style('opacity',function (datum) { return (d != datum) ? .25 : 1 })
		
		viz.removeDataTip();
		viz.showDataTip(e,d,i)
	}
	
	function styles_onMouseOut(e,d,i) {
		plot.selectAll('.vz-treemap-cell-group')
		 .transition('style_mouseover')
		 .style('opacity',1)
		
		viz.removeDataTip();
	}
	
	
	function styles_onClick(e,d,i) {
		if (!d.children) { return; }
		
		if (drillPath.indexOf(d.parent.data) < 0) {
			drillPath.push(d.parent.data);
		}
		if (drillPath.indexOf(d) < 0) {
			drillPath.push(d.data);
		}
		update(d.data);
		
	}
	
	function drillPath_onClick(d) {
		drillPath.splice(drillPath.indexOf(d)+1,drillPath.length - drillPath.indexOf(d) - 1);
		update(d);
	}
	
	function getCellParent(d) {
		if (d.depth == 1)
			return d
		else
			return getCellParent(d.parent)
	}
	
	function dataTipRenderer(tip, e, d, i, x, y) {
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>';
		
		var h1 = scope.label(d.data);
		var h2 = scope.valueFormatter(d.value);
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		
		y = d3.select(e).select('rect').node().getBoundingClientRect().top + window.pageYOffset;
		
		tip.style('height',null).html(html).style('display','block');
		
		return [(Number(x) + e.getBoundingClientRect().width)+10,y-10]
		
	}
	
	// Returns our viz component :)
	return viz;
}