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

// @version 2.1.145

/**
 * @class
 */
vizuly2.viz.TreeMap = function (parent) {
	
	var d3 = vizuly2.d3;
	
	/** @lends vizuly2.viz.TreeMap.properties */
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
		 * @default  {top:'5%', bottom:'5%', left:'8%', right:'10%'}
		 */
		'margin': {
			'top': '2%',
			'bottom': '2%',
			'left': '2%',
			'right': '2%'
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
		 * Function that returns value that determines the total area of a given rectangle plot.
		 * @member {String}
		 * @default function (d) { return d.value }
		 */
		'value': function (d) {
			return d.value
		},
		/**
		 * Function that returns value that determines the total area of a given rectangle plot.
		 * @member {String}
		 * @default function (d) { return d3.format(',')(d) }
		 */
		'valueFormatter': function (d) { return d3.format(',')(d) },
		/**
		 * Function that returns a unique identifier for a given datum.
		 *
		 * @member {String}
		 * @default function (d) { return d.key }
		 *
		 */
		'key': function (d) { return d.key },
		/**
		 * Function that returns string label displayed in rectangle plot.
		 * @member {String}
		 * @default function (d) { return d.label }
		 */
		'label': function (d) { return d.label },
		/**
		 * Function that returns string label positioned above child rectangles plots.
		 * @member {String}
		 * @default function (d) { return d.label }
		 */
		'groupLabel': function (d) { return d.label },
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
		 * // j - group index (optional)
		 * // x - suggested x position of data tip
		 * // y - suggested y position of data tip
		 * // return {Array} [x, y] - x and y coordinates placing data tip.
		 *
		 *function dataTipRenderer(tip, e, d, i, j, x, y) {
		 *     var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 *		 '<div class="vz-tip-header-rule"></div>' +
		 *		 '<div class="vz-tip-header2"> HEADER2 </div>';
		 *
		 *		var h1 = scope.label(d.data);
		 *		var h2 = scope.valueFormatter(d.value);
		 *
		 *		html = html.replace("HEADER1", h1);
		 *		html = html.replace("HEADER2", h2);
		 *
		 *		y = d3.select(e).select('rect').node().getBoundingClientRect().top + window.pageYOffset;
		 *
		 *		tip.style('height',null).html(html).style('display','block');
		 *
		 *		return [(Number(x) + e.getBoundingClientRect().width)+10,y-10]
		 *}
		 */
		'dataTipRenderer' : dataTipRenderer
	};
	
	var styles = {
		'background-opacity': 1,
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
			var color1 = vizuly2.util.rgbToHex(d3.rgb(color));
			var color2 = vizuly2.util.rgbToHex(d3.rgb(color).darker(1));
			return 'url(#' + vizuly2.svg.gradient.blend(viz, color2, color1).attr('id') + ')';
		},
		'cell-stroke': 'none',
		'cell-stroke-width': 1,
		'cell-stroke-opacity':1,
		'cell-fill-opacity': .8,
		'cell-fill-over': function (e, d, i) {
			return viz.getStyle('cell-fill',arguments)
		},
		'cell-stroke-over': function (e, d, i) {
			return viz.getStyle('cell-fill',arguments)
		},
		'cell-stroke-opacity-over': 1,
		'cell-fill-opacity-over': 1,
		'header-font-size': 20,
		'header-label-color': function (d,i) {
			var colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
			return colors[d._rootIndex % colors.length];
		},
		'group-label-color': '#777'
	}
	
	/** @lends vizuly2.viz.TreeMap.events */
	var events = [
		/**
		 * Fires when user moves the mouse over a node rectangle.
		 * @event vizuly2.viz.TreeMap.mouseover
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
		 * Fires when user moves the mouse off a node rectangle.
		 * @event vizuly2.viz.TreeMap.mouseout
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
		 * Fires when user clicks on a given node rectangle.
		 * @event vizuly2.viz.TreeMap.click
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
	
	var size, headerHeight;           // Holds the 'size' variable as defined in viz.util.size()
	
	// These are all d3.selection objects we use to insert and update svg elements into
	var svg, plot, background, header, defs;
	
	var treemap = d3.treemap();
	
	var root, node, rootAncestors;
	
	var dataIsDirty = true;
	
	var drillPath = [];
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.util.getDefs(viz);
		header = svg.append('g').attr('class','vz-treemap-header');
		plot = svg.append('g').attr('class','vz-treemap-plot');
		
		viz.on('data_change',function() { dataIsDirty = true })
		
		scope.dispatch.apply('initialized', viz);
	}
	
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure(d) {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		rootAncestors = [];
		scope.children(scope.data).forEach(function (d) {
			rootAncestors.push(scope.key(d));
		})
		
		if (dataIsDirty == true) {
			root = d3.hierarchy(scope.data, scope.children)
			 .eachBefore(function(d) {
			 	 d.parentId = d.parent ? vizuly2.util.createCSSKey(scope.key(d.parent.data)) : 'none'
				 d.id = vizuly2.util.createCSSKey(scope.key(d.data));
				 
				 //console.log("id = " + d.id)
				 if (d.depth == 1) {
					 d.rootAncestor = scope.key(d.data);
					 d.rootIndex = rootAncestors.indexOf(d.rootAncestor);
				 }
			 })
			 .sum(scope.value)
			 .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
			
			root.children.forEach(function (d) {
				setRootIndex(d, d.rootAncestor, d.rootIndex)
			})
		}
		
		node = d;
		
		if (!node) {
			node = root;
		}
		
		headerHeight = viz.getStyle('header-font-size') + viz.getStyle('cell-padding-top', [{'depth': 1}]);
		
		//clear all values
		resetTreeMapProps(node, 0);
		
		treemap
		 .tile(d3.treemapResquarify)
		 .size([size.width, size.height - headerHeight])
		 .round(true)
		 .paddingInner(viz.style('cell-padding'))
		 .paddingTop(viz.style('cell-padding-top'))
		
		treemap(node);
		
		drillPath = [];
		var dn = node;
		while(dn.parent) {
			drillPath.push(dn);
			dn = dn.parent;
		}
		drillPath.push(root)
		drillPath.reverse();
		
		scope.size = size;
		
		// Tell everyone we are done making our measurements
		scope.dispatch.apply('measured', viz);
		
	}
	
	function setRootIndex(child, rootAncestor, rootIndex) {
		child.rootAncestor = rootAncestor;
		child.rootIndex = rootIndex;
		if (child.children) {
			child.children.forEach(function (d, i) {
				setRootIndex(d, rootAncestor, rootIndex)
			})
		}
	}
	
	function resetTreeMapProps(node, depth) {
		delete node.x0;
		delete node.x1;
		delete node.y0;
		delete node.y1;
		delete node._squarify;
		delete node.height;
		node.depth = depth;
		
		if (node.children) {
			node.children.forEach(function (d) {
				resetTreeMapProps(d, node.depth + 1)
			})
		}
	}
	
	// The update function is the primary function that is called when we want to render the visualiation based on
	// all of its set properties.  A developer can change propertys of the components and it will not show on the screen
	// until the update function is called
	function update(d) {
		
		// Call measure each time before we update to make sure all our our layout properties are set correctly
		measure(d);
		
		// Layout all of our primary SVG d3.elements.
		svg.attr('width', size.measuredWidth).attr('height', size.measuredHeight);
		background.attr('width', size.measuredWidth).attr('height', size.measuredHeight);
		header.attr('transform', 'translate(' + size.left + ',' + (size.top) + ')');
		plot.attr('transform', 'translate(' + size.left + ',' + (size.top + headerHeight) + ')');
		
		var cellOffset = 5;
		
		var groups = plot.selectAll('.vz-treemap-group').data(node.children, function (d) {
			return d.id
		});
		
		groups.exit().remove();
		groups = groups.enter()
		 .append('g')
		 .attr('class', function (d) { return 'vz-treemap-group group-id_' + d.id })
		 .merge(groups);
		
		groups.each(function (datum, datumIndex) {
			var group = d3.select(this);
			
			var renderData = datum.children ? datum.children : [datum];
			
				var cell = group.selectAll('.vz-treemap-cell')
				 .data(renderData, function (d, i) {
					 return d.id
				 });
				
				cell.exit().remove();
				
				var cellEnter = cell.enter().append('g')
				 .attr('class', function (d) {
					 //		 return 'vz-treemap-cell-group group_' + d.id })
					 return 'vz-treemap-cell parent-id_' + d.parentId + ' id_' + d.id
				 })
				 .on('mouseover', function (d, i) {
					 scope.dispatch.apply('mouseover', viz, [this, d, i])
				 })
				 .on('mouseout', function (d, i) {
					 scope.dispatch.apply('mouseout', viz, [this, d, i])
				 })
				 .style('cursor', function (d) {
					 return d.children ? 'pointer' : 'not-allowed'
				 })
				
				cellEnter.append('rect')
				 .attr('class', 'vz-treemap-cell-rect')
				 .attr('id', function (d) {
					 return d.id;
				 })
				 .on('click', function (d, i) {
					 scope.dispatch.apply('click', viz, [this, d, i])
				 })
				
				cell = cellEnter.merge(cell);
				
				cell.each(function (d, i) {
					var g = d3.select(this);
					
					g.attr('transform', function (d) {
						 return 'translate(' + d.x0 + ',' + d.y0 + ')';
					 })
					
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
					var w = d.x1 - d.x0;
					var h = d.y1 - d.y0;
					
					if ((scope.label(d.data).length * fontSize) / (w) < h / fontSize && h > fontSize * 2 + padding) {
						
						var label = g.append('text')
						 .datum(d)
						 .attr('class', 'vz-treemap-cell-label')
						 .attr('y', fontSize)
						 .attr('x', 0)
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
				 .attr('transform', function (d) {
					 return 'translate(' + d.x0 + ',' + d.y0 + ')';
				 });
				
			// Add group labels
			if (datum.children) {
				var labelText = scope.groupLabel(datum)
				var firstChild = datum.children[0];
				group.selectAll('.vz-group-label').remove();
				
				var label = group.append('text')
				 .datum(d)
				 .attr('class', 'vz-group-label')
				 .attr('transform', 'translate(' + firstChild.x0 + ',' + (firstChild.y0 - 5) + ')')
				 .style('cursor', 'pointer')
				 .style('font-size', function (d, i) {
					 return viz.getStyle('cell-font-size', [this, datum, datumIndex]) + 'px'
				 })
				 .text(labelText)
				 .on('click', function (d, i) {
					 scope.dispatch.apply('click', viz, [this, datum, datumIndex])
				 })
				
				
				if (label.node()) {
					var labelWidthRatio = (datum.x1 - datum.x0) / label.node().getComputedTextLength()
					if (labelWidthRatio < 1) {
						label.text(labelText.substr(0, Math.round(labelText.length * labelWidthRatio) - 3) + '...');
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
	}

	function updateDrillPath() {
		header.selectAll('.vz-drill-label').remove();
		
		var xOffset = 0; // rootLabel.node().getBoundingClientRect().width + viz.getStyle('header-font-size',arguments)/2;
		
		var drillLabels = header.selectAll('.vz-drill-label').data(drillPath);
		
		drillLabels.enter()
		 .append('text')
		 .attr('class','vz-drill-label')
		 .text(function (d,i) { return (i > 0 ? ' > ' : '') + scope.label(d.data)})
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
	
	/**
	 *  Triggers the render pipeline process to refresh the component on the screen.
	 *  @method vizuly2.viz.TreeMap.update
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
		{on: 'click.styles', callback: styles_onClick}
	];
	
	viz.applyCallbacks(stylesCallbacks);
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		// Grab the d3.selection from the viz so we can operate on it.
		var selection = scope.selection;
		
		var styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-color-bottom'), viz.getStyle('background-color-top'));
		
		// Update the background
		selection.selectAll(".vz-background").style("fill", function () {
			return "url(#" + styles_backgroundGradient.attr("id") + ")";
		})
		 .style('opacity',viz.getStyle('background-opacity'));
		
		plot.selectAll('.vz-treemap-cell-rect')
		 .attr('vz', function (d,i) { return viz.getStyle('cell-corner-radius',[this, d])})
		 .attr('ry', function (d,i) { return viz.getStyle('cell-corner-radius',[this, d])})
		 .style('fill', function (d,i) { return viz.getStyle('cell-fill',[this, d, i])})
		 .style('fill-opacity', function (d,i) { return viz.getStyle('cell-fill-opacity',[this, d, i] )})
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
		
		console.log("mouseenter")
		
		plot.selectAll('.vz-treemap-cell-rect').filter(function (datum) { return d != datum})
		 .transition('style_mouseover')
		 .style('opacity',0.25)
		
		plot.selectAll('.vz-treemap-cell-rect').filter(function (datum) { return d == datum})
		 .transition('style_mouseover')
		 .style('fill', function (d,i) { return viz.getStyle('cell-fill-over',[this, d, i])})
		 .style('fill-opacity', function (d,i) { return viz.getStyle('cell-fill-opacity-over',[this, d, i] )})
		 .style('stroke', function (d,i) { return viz.getStyle('cell-stroke-over',[this, d, i])})
		 .style('stroke-opacity-over', function (d,i) { return viz.getStyle('cell-stroke-opacity-over',[this, d, i])})
		
		viz.removeDataTip();
		viz.showDataTip(e,d,i)
	}
	
	function styles_onMouseOut(e,d,i) {
		
		console.log("mouseout")
		
		plot.selectAll('.vz-treemap-cell-rect')
		 .transition('style_mouseover').duration(0)
		 .style('fill', function (d,i) { return viz.getStyle('cell-fill',[this, d, i])})
		 .style('fill-opacity', function (d,i) { return viz.getStyle('cell-fill-opacity',[this, d, i] )})
		 .style('stroke', function (d,i) { return viz.getStyle('cell-stroke',[this, d, i])})
		 .style('stroke-width', function (d,i) { return viz.getStyle('cell-stroke-width',[this, d, i])})
		 .style('stroke-opacity', function (d,i) { return viz.getStyle('cell-stroke-opacity',[this, d, i])})
		 .style('opacity',1)
		
		viz.removeDataTip();
	}
	
	
	function styles_onClick(e,d,i) {
		if (!d.children) { return; }
		
	//	if (drillPath.indexOf(d.parent.data) < 0) {
	//		drillPath.push(d.parent);
	//	}
	//	if (drillPath.indexOf(d) < 0) {
	//		drillPath.push(d);
	//	}
		update(d);
		
	}
	
	function drillPath_onClick(d) {
		//drillPath.splice(drillPath.indexOf(d)+1,drillPath.length - drillPath.indexOf(d) - 1);
		update(d);
	}
	
	function getCellParent(d) {
		if (d.depth == 1)
			return d
		else
			return getCellParent(d.parent)
	}
	
	function dataTipRenderer(tip, e, d, i, j, x, y) {
		
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