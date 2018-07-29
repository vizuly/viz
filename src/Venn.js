/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.45

vizuly2.viz.Venn = function (parent) {
	
	// This is the object that provides pseudo "protected" properties that the vizuly2.viz function helps create
	var scope = {};
	
	var d3 = vizuly2.d3;
	
	var util = vizuly2.viz.VennUtil();
	
	var properties = {
		"data": null,
		"margin": {                            // Our margin object
			"top": "10",                       // Top margin
			"bottom": "10",                    // Bottom margin
			"left": "10",                      // Left margin
			"right": "10"                      // Right margin
		},
		"width": 300,                          // Overall width of component
		"height": 300,                         // Height of component
		"padding": 15,
		"wrapLabels": true,
		"key": function (d) { return d.setKey },
		"label": function (d) { return d.label },
		"value": function (d) { return d.value },
		"dataTipRenderer" : dataTipRenderer
	};
	
	var styles = {
		'background': '#fff',
		'fill-color': function (d,i) {
			var colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
			var ret = colors[d.sets % (colors.length-1)];
			console.log('color: ' + ret);
			return ret;
		},
		'fill-opacity': 0.25
	}
	
	// Create our viz and type it
	var viz = vizuly2.core.component(parent, scope, properties);
	
	var size;  // Holds the 'size' variable as defined in viz.util.size()
	var totalSize;
	
	
	// These are all d3.selection objects we use to insert and update svg elements into
	var svg, plot, background, defs;
	
	var circles, labels, textCentres;
	
	var textScale = d3.scaleLinear().range([8,28]);
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		viz.defaultStyles(styles);
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		plot = svg.append('g').attr("class","vz-plot");
		defs = vizuly2.core.util.getDefs(viz);
		
		scope.dispatch.apply('initialize', viz);
	}
	
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height);
		
		util.sizeFunction(scope.value)
		
		var orientation = Math.PI / 2,
		 normalize = true,
		 styled = false,
		 fontSize = null,
		 orientationOrder = null,
		 
		 layoutFunction = util.venn,
		 loss = util.lossFunction;
		
		var solution = layoutFunction(scope.data, {lossFunction: loss});
		if (normalize) {
			solution = util.normalizeSolution(solution, orientation, orientationOrder);
		}
		circles = util.scaleSolution(solution, size.width, size.height, scope.padding);
		textCentres = util.computeTextCentres(circles, scope.data);
		
		// Figure out the current label for each set. These can change
		// and D3 won't necessarily update (fixes https://github.com/benfred/venn.js/issues/103)
		labels = {};
		scope.data.forEach(function(datum) {
			if (scope.label(datum)) {
				labels[datum.sets] = scope.label(datum);
			}
		});
		
		textScale.domain([d3.min(scope.data,function (d) { return d.size }), d3.max(scope.data,function (d) { return scope.value(d) })]);
		
		totalSize = d3.sum(scope.data,function (d) { return scope.value(d); })
		
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
		svg.attr("width", scope.width).attr("height", scope.height);
		background.attr("width", scope.width).attr("height", scope.height);
		
		/***  BRUTE FORCE - FORCING REMOVAL OF ALL NODES ***/
		// Should look at the remaining logic as it does not expect this
		 plot.selectAll('.vz-venn-area').remove();
		
		// to properly transition intersection areas, we need the
		// previous circles locations. load from elements
		var previous = {}, hasPrevious = false;
		plot.selectAll(".vz-venn-area path").each(function (d) {
			var path = d3.select(this).attr("d");
			if ((d.sets.length == 1) && path) {
				hasPrevious = true;
				previous[d.sets[0]] = util.circleFromPath(path);
			}
		});
		
		// update data, joining on the set ids
		var nodes = plot.selectAll(".vz-venn-area")
		 .data(scope.data, function(d) { return scope.key(d) });
		
		// remove old
		var exit = nodes.exit().remove();
		
		// create new nodes
		var enter = nodes.enter()
		 .append('g')
		 .attr("class", function(d) {
			 return "vz-venn-area venn-" +
				(d.sets.length == 1 ? "circle" : "intersection")
			  ;
		 })
		 .attr("data-venn-sets", function(d) {
			 return d.sets.join("_");
		 })
		 .on('mouseover', function (d,i) { scope.dispatch.apply('mouseover',viz, [this, d, i])})
		 .on('mouseout', function (d,i) { scope.dispatch.apply('mouseout',viz, [this, d, i])});
		
		var enterPath = enter.append("path").style('fill-opacity', 0.5);
		var enterText = enter.append("text")
		 .attr("class", "label")
		 .text(function (d) { return scope.label(d); } )
		 .attr("text-anchor", "middle")
		 .attr("dy", function (d) { return textScale(scope.value(d)) + 'px'})
		 .attr("x", size.width/2)
		 .attr("y", size.height/2);
		
		// update existing, using pathTween if necessary
		var update = plot;
		if (hasPrevious) {
			update = plot.transition("venn").duration(scope.duration);
			update.selectAll("path").attrTween("d", pathTween);
		} else {
			update.selectAll("path").attr("d", function(d) {
				return util.intersectionAreaPath(d.sets.map(function (set) { return circles[set]; }));
			});
		}
		
		var updateText = update.selectAll(".label")
		 .filter(function (d) { return d.sets in textCentres; })
		 .text(function (d) { return scope.label(d); } )
		 .attr("x", function(d) {  return Math.floor(textCentres[d.sets].x);})
		 .attr("y", function(d) { return Math.floor(textCentres[d.sets].y);});
		
		
		if (scope.wrapLabels) {
			if (hasPrevious) {
				updateText.on("end", function (d) {
					util.wrapText(d3.select(this), circles, scope.label, textScale(scope.value(d)))
				});
			} else {
				updateText.each( function (d) {
					util.wrapText(d3.select(this), circles, scope.label, textScale(scope.value(d)))
				});
			}
		}
		
		//Adjust plot to center it
		var bounds = plot.node().getBoundingClientRect();
		var x = (size.width-bounds.width)/2;
		var y = (size.height-bounds.height)/2;
		
		plot.attr('transform','translate(' + x + ',' + y + ')');
		
		scope.dispatch.apply('update', viz);
		
		// interpolate intersection area paths between previous and
		// current paths
		var pathTween = function(d) {
			return function(t) {
				var c = d.sets.map(function(set) {
					var start = previous[set], end = circles[set];
					if (!start) {
						start = {x : size.width/2, y : size.height/2, radius : 1};
					}
					if (!end) {
						end = {x : size.width/2, y : size.height/2, radius : 1};
					}
					return {'x' : start.x * (1 - t) + end.x * t,
						'y' : start.y * (1 - t) + end.y * t,
						'radius' : start.radius * (1 - t) + end.radius * t};
				});
				return util.intersectionAreaPath(c);
			};
		};
		
	}
	
	function dataTipRenderer(tip, e, d, i) {
		tip.style('text-align','center').append('div').text('datatip');
		return true;
	}
	
	// This is our public update call that all vizuly2.viz's implement
	viz.update = function () {
		update();
		return viz;
	};
	
	// styless and styles
	var stylesCallbacks = [
		{on: 'update.styles', callback: applyStyles},
		{on: 'mouseover.styles', callback: styles_onMouseOver},
		{on: 'mouseout.styles', callback: styles_onMouseOut}
	];
	
	viz.applyCallbacks(stylesCallbacks);
	
	function applyStyles() {
		
		// If we don't have a skin we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		var selection = scope.selection;
		
		// Update the background
		selection.selectAll(".vz-background").attr("fill", function () { return viz.getStyle('background',viz) });
		
		selection.selectAll('.vz-venn-area.venn-circle')
		 .style("fill", function(d,i) { return viz.getStyle('fill-color', arguments); })
		
		selection.selectAll('.vz-venn-area.venn-circle path').style("fill-opacity", function (d,i) { return viz.getStyle('fill-opacity', arguments)});
		
		selection.selectAll('.vz-venn-area text.label').style("font-size", function (d,i) { return textScale(scope.value(d)) + 'px'});
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	
	function styles_onMouseOver(e, d, i) {
		viz.showDataTip(e, d, i);
	}
	
	function styles_onMouseOut(e, d, i) {
		viz.removeDataTip();
	}
	
	function dataTipRenderer(tip, e, d, i, x, y) {
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header3" style="font-size:12px;"> HEADER3 </div>';
		
		
		var h1 = scope.label(d);
		var h2 = scope.value(d) + ' : ' + (Math.round((scope.value(d)/totalSize) * 100)) + '%';
		var h3 = ''; //scope.series(d);
		var h = 70;
		
		if (d.parentSets) {
			h1 = '';
			h3 = '';
			d.parentSets.forEach(function (set) {
				if (h1.length > 0) h1 = h1 + ' - ';
				h1 = h1 + scope.label(set);
				h3 = h3 + '<div style="margin:5px">' + scope.label(set) + ' : ' + (Math.round((scope.value(d)/scope.value(set)) * 100)) + '%</div>';
			})
			
			h = h + (25 * (d.parentSets.length-1));
		}
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		html = html.replace("HEADER3", h3);
		
		tip.style('height', h + 'px').html(html);
		
		return [(Number(x) + Number(d3.select(e).attr('width'))),y - 50]
		
	}

	
	initialize();
	
	// Returns our glorious viz component :)
	return viz;
}

