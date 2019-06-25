/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 This source code is covered under the following license: http://vizuly.io/commercial-license/
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.220

/**
 * @class
 */
vizuly2.viz.Halo = function (parent) {
	
	var d3 = vizuly2.d3;
	var d3v3 = vizuly2.d3v3;
	
	/** @lends vizuly2.viz.Halo.properties */
	var properties = {
		/**
		 * Array of "transactions" where each datum contains three unique keys that are used to display a "source", "target", and "group"
		 * @member {Array}
		 * @default Needs to be set at runtime
		 *
		 * @example
		 * [{
		 * 	"CMTE_ID": "C00367995",
		 * 	"FILE_NUM": "714521",
		 * 	"TRANSACTION_TP": "24K",
		 * 	"Month": "1",
		 * 	"Day": "18",
		 * 	"Year": "2011",
		 * 	"TRANSACTION_AMT": "2000",
		 * 	"STATE": "GA",
		 * 	"ENTITY_TYPE": "PAC",
		 * 	"CAND_ID": "H2GA01157",
		 * 	"CAND_NAME": "KINGSTON, JACK REP.",
		 * 	"OFFICE": "H",
		 * 	"PTY": "REP",
		 * 	"Key": "H0",
		 * 	"CMTE_NM": "SIERRA NEVADA CORPORATION PAC"
		 *  },
		 *  {
		 * 	"CMTE_ID": "C00142315",
		 * 	"FILE_NUM": "722322",
		 * 	"TRANSACTION_TP": "24K",
		 * 	"Month": "2",
		 * 	"Day": "1",
		 * 	"Year": "2011",
		 * 	"TRANSACTION_AMT": "3500",
		 * 	"STATE": "CA",
		 * 	"ENTITY_TYPE": "PAC",
		 * 	"CAND_ID": "H8CA20059",
		 * 	"CAND_NAME": "NUNES, DEVIN GERALD",
		 * 	"OFFICE": "H",
		 * 	"PTY": "REP",
		 * 	"Key": "H1",
		 * 	"CMTE_NM": "BOYD GAMING POLITICAL ACTION COMMITTEE"
		 *  },
		 *  . . .
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
		 * Distance in radial degrees between each outer halo group arc.
		 * @member {Number}
		 * @default  1
		 */
		'padAngle': 1,
		/**
		 * Thickness in pixels of each halo group arc expressed as percentage of total radius
		 * @member {Number}
		 * @default  0.05
		 */
		'haloThickness': 0.05,
		/**
		 * Function that returns a key value for the given halo that the datum it is associated with.
		 * @member {Function}
		 * @default  null - must be set at runtime
		 * @example
		 * function (d) { return d.haloKey }
		 */
		'haloKey': null,
		/**
		 * Function that returns label value for a given halo group arc.
		 * @member {Function}
		 * @default function (d) { return d.haloLabel }
		 */
		'haloLabel': function (d) { return d.haloLabel },
		/**
		 * Function that returns unique key value for a given datum that will be represented as a circular node.
		 * @member {Function}
		 * @default null - must be set at runtime.
		 */
		'nodeKey': null,
		/**
		 * Function that returns label value for a given node.
		 * @member {Function}
		 * @default function (d) { return d.nodeLabel }
		 */
		'nodeLabel' : function (d) { return d.nodeLabel },
		/**
		 * Function that returns a key value for the given node group (inner cluster grouping) that the datum it is associated with.
		 * @member {Function}
		 * @default  null - must be set at runtime
		 * @example
		 * function (d) { return d.nodeGroupKey }
		 */
		'nodeGroupKey': null,
		/**
		 * Function that returns label value for a given datum's node group.
		 * @member {Function}
		 * @default function (d) { return d.nodeGroupLabel }
		 */
		'nodeGroupLabel' : function (d) { return d.nodeGroupLabel },
		/**
		 * Function that returns the value used to calculate a nodes circular area for a given datum.
		 * @member {Function}
		 * @default null - must be set at runtime.
		 */
		'value': null,
		/**
		 * Formatter function that returns a display ready version of a given datum's value.
		 * @member {Function}
		 * @default function (d) { return d.value }
		 */
		'valueFormatter' : function (d) { return d.value },
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
		 *		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 *		 '<div class="vz-tip-header-rule"></div>' +
		 *		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 *		 '<div class="vz-tip-header-rule"></div>' +
		 *		 '<div class="vz-tip-header3"> HEADER3 </div>';
		 *
		 *		var h1 = scope.nodeGroupLabel(d.values ? d.values[0] : d.data);
		 *		var h2 = scope.nodeLabel(d.values ? d.values[0] : d.data);
		 *		var h3 = scope.valueFormatter(d.value);
		 *
		 *		html = html.replace("HEADER1", h1);
		 *		html = html.replace("HEADER2", h2);
		 *		html = html.replace("HEADER3", h3);
		 *
		 *		tip.style('width','225px').style('height','80px').html(html);
		 *
		 *		return [(Number(x) - 110),y - 90 - d.r]
		 *}
		 */
		'dataTipRenderer' : dataTipRenderer
	};
	
	var styles = {
		'background-opacity': 1,
		'background-color-top': '#FFF',
		'background-color-bottom': '#DDD',
		'label-background': '#000',
		'label-color': '#FFF',
		'label-fill-opacity': .75,
		'link-stroke': function (d, i) {
			var colors = ["#CD57A4", "#B236A3", "#FA6F7F", "#FA7C3B", "#E96B6B"];
			return colors[i % colors.length];
		},
		'link-stroke-opacity': 0.05,
		'link-fill': function (d, i) {
			var colors = ["#89208F", "#C02690", "#D93256", "#DB3D0C", "#B2180E"];
			return colors[i % colors.length];
		},
		'link-fill-opacity': .3,
		'link-node-fill-opacity': .25,
		'node-stroke': function (d, i) {
			var colors = ["#CD57A4", "#B236A3", "#FA6F7F", "#FA7C3B", "#E96B6B"];
			return colors[i % colors.length];
		},
		'node-stroke-opacity': 0.15,
		'node-stroke-over': '#00236C',
		'node-fill': function (d, i) {
			var colors = ["#89208F", "#C02690", "#D93256", "#DB3D0C", "#B2180E"];
			return colors[i % colors.length];
		},
		'node-fill-opacity': 0.75,
		'arc-fill': function (d, i) {
			var colors = ["#89208F", "#C02690", "#D93256", "#DB3D0C", "#B2180E"];
			return colors[i % colors.length];
		},
		'arc-slice-fill-opacity': .75,
		'arc-fill-opacity': .15,
		'arc-fill-over': '#00236C'
	}
	
	/** @lends vizuly2.viz.Halo.events */
	var events = [
		/**
		 * Fires when user moves the mouse over a node.
		 * @event vizuly2.viz.Halo.nodeover
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseover', function (e, d, i) { ... });
		 */
		'nodeover',
		/**
		 * Fires when user moves the mouse off a node.
		 * @event vizuly2.viz.Halo.nodeeout
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseout', function (e, d, i) { ... });
		 */
		'nodeout',
		/**
		 * Fires when user moves the mouse over a link path (connecting shape between halo and node.)
		 * @event vizuly2.viz.Halo.linkover
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseover', function (e, d, i) { ... });
		 */
		'linkover',
		/**
		 * Fires when user moves the mouse off a link path (connecting shape between halo and node.)
		 * @event vizuly2.viz.Halo.linkout
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseout', function (e, d, i) { ... });
		 */
		'linkout',
		/**
		 * Fires when user moves the mouse over a halo arc.
		 * @event vizuly2.viz.Halo.arcover
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseover', function (e, d, i) { ... });
		 */
		'arcover',
		/**
		 * Fires when user moves the mouse off a halo arc.
		 * @event vizuly2.viz.Halo.arcout
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseout', function (e, d, i) { ... });
		 */
		'arcout',
		/**
		 * Fires when user clicks on a given node.
		 * @event vizuly2.viz.Halo.nodeclick
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('click', function (e, d, i) { ... });
		 */
		'nodeclick',
	]
	
	var scope = {};
	scope.initialize = initialize;
	scope.properties = properties;
	scope.styles = styles;
	scope.events = events;
	
	//Create our viz and type it
	var viz = vizuly2.core.component(parent, scope);
	viz.version = '2.1.220';
	
	// Flag to see if data has changed - we need this because the data will need to be re-prepped if this happens
	var _dataChanged = false;
	viz.on("data_change.internal", function () {
		_dataChanged = true;
	});
	
	// Measurements
	
	var size;                   // Holds the 'size' variable as defined in viz.util.size()
	var radian = Math.PI / 180;   // Constant for radian conversion
	var innerRadius;            // Calculated inner radius of Halo
	var outerRadius;           // Calculated outer radius of Halo
	
	// Definitions
	// Halo: The outer ring surrounding all of the nodes
	// Halo Group: A section of the halo (one segment of the halo)  (haloKey)
	// Halo Slice: A slice of a Halo Group (one segment within a halo group) (each row in data source)
	// Node: The circles in the middle of the visual (nodeKey)
	// Link: The path elements that link a Halo Slice to a node (each row in data source)
	// Cluster: A distinct group of nodes (democrat vs. republican) (nodeGroupKey)
	
	// d3 path generator for the halo arcs
	var haloArc = d3.arc();
	
	// d3 layout for each halo group
	var haloLayout = d3.pie();
	
	// d3 layout for each halo slice
	var haloSliceLayout = d3.pie();
	
	// d3 layout for radius and position of each node
	var nodeLayout = d3v3.layout.pack();
	
	// d3 diagonal path generator for each link
	var linkLayout = d3v3.svg.diagonal.radial();
	
	// For this visual we have a lot of data prep and object relationships to keep track of.
	// We store them here:
	
	var haloArcs;                   // Stores all of the data grouped by halo arcs
	var nodes;                  // Stores all of the data grouped by nodes
	var nodeHash;               // A hash that connects each node to the links that come into it
	var clusters;               // Contains the node groups
	var nodeData;               // Layout data from the nodeLayout
	
	// These are all d3.selection objects we use to insert and update svg elements int
	var svg, g, background, plot, plotBackground, haloPlot, nodePlot, linkPlot, defs;
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the individual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as D3 selections.
	function initialize() {
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.util.getDefs(viz);
		g = svg.append("g").attr("class", "vz-halo-viz");
		plot = g.append("g").attr("class", "vz-halo-plot");
		plotBackground = plot.append("rect").attr("class", "vz-plot-background");
		linkPlot = plot.append("g").attr("class", "vz-halo-link-plot");
		nodePlot = plot.append("g").attr("class", "vz-halo-node-plot");
		haloPlot = plot.append("g").attr("class", "vz-halo-arc-plot");
		
		// Tell everyone we are done initializing
		scope.dispatch.apply('initialized', viz);
	}
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// If the data has changed since the last time we were called then we need to re prep the data
		// and remove all elements.
		if (_dataChanged == true) {
			prepData();
			linkPlot.selectAll("path").remove();
			linkPlot.selectAll("circle").remove();
			haloPlot.selectAll("path").remove();
			nodePlot.selectAll("circle").remove();
			_dataChanged = false;
		}
		
		// Get our size based on height, width, and margin
		size = vizuly2.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		// Calcuate the outer radius of the halo
		outerRadius = Math.min(size.width, size.height) / 2;
		
		// Calculate the inner radius of the halo
		innerRadius = outerRadius * (1 - scope.haloThickness);
		
		// Set our node layout properties
		nodeLayout.size([innerRadius*2 *.99,innerRadius*2 * .99])
		 .padding(2)
		 .sort(null)
		 .value(function (d) { return d.value; })
		 .children(function (d) { return d.children; });
		
		// Get our node layout data to render (we remove the outermost nodes, which are the node groups, we don't
		// want to render these, just use them for the pack layout calcs.
		nodeData = nodeLayout.nodes({children:clusters}).filter(function (d) { return (d.depth > 1)});
		
		// The node hash contains total amounts for every link associated with a node, we need these
		// We store this value in the aggregate property.  We use this to determine the radius of the node
		for (var node in nodeHash) {
			nodeHash[node].aggregate = 0;
		};
		
		// Set our halo layout properties
		haloLayout.padAngle(scope.padAngle * radian)
		 .startAngle(0)
		 .endAngle(360 * radian)
		 .value(function (d) {
			 return d.value;
		 });
		
		// Set our halo slice layout properties
		haloSliceLayout.value(scope.value).padAngle(0);
		
		// Set our halo arc path generator properties
		haloArc.outerRadius(outerRadius).innerRadius(innerRadius);
		size.outerRadius = outerRadius;
		size.innerRadius = innerRadius;
		scope.size = size;
		
		// Tell everyone we are done measuring
		scope.dispatch.apply('measured', viz);
		
	}
	
	// The update function is the primary function that is called when we want to render the visualiation based on
	// all of its set properties.  A developer can change properties of the components and it will not show on the screen
	// until the update function is called
	function update() {
		
		// Call measure each time before we update to make sure all our our layout properties are set correctly
		measure();
		
		// Update our major place holder elements
		svg.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		background.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		plot.style("width", size.width).style("height", size.height).attr("transform", "translate(" + size.left + "," + size.top + ")");
		haloPlot.attr("transform", "translate(" + size.width / 2 + "," + size.height / 2 + ")");
		linkPlot.attr("transform", "translate(" + size.width / 2 + "," + size.height / 2 + ")");
		nodePlot.attr("transform", "translate(" + (size.width - innerRadius * 2) / 2 + "," + (size.height - innerRadius * 2) / 2 + ")");
		
		// Each node gets its own circle - we create them here and add our event dispatches
		var circle = nodePlot.selectAll(".vz-halo-node").data(nodeData);
		
		circle.exit().remove();
		
		circle = circle.enter().append("circle").attr("class", function (d) {
			 return "vz-halo-node node-key_" + d.key;
		 })
		 .on("mouseover", function (d, i) {
			 scope.dispatch.apply('nodeover', viz ,[this, d, i])
		 })
		 .on("mouseout", function (d, i) {
			 scope.dispatch.apply('nodeout', viz ,[this, d, i])
		 })
		 .on("click", function (d, i) {
			 scope.dispatch.apply('nodeclick', viz ,[this, d, i])
		 })
		 .merge(circle);
		
		circle.attr("r", 0)
		 .attr("cx", function (d) {
			 return d.x
		 })
		 .attr("cy", function (d) {
			 return d.y
		 })
		 .transition().duration(scope.duration).attr("r", function (d) {
			return d.r;
		});
		
		
		// Create the primary halo arcs based on the halo groups and add our event dispatches
		var haloGroup = haloPlot.selectAll(".vz-halo-arc").data(haloLayout(haloArcs));
		haloGroup.exit().remove();
		
		haloGroup = haloGroup.enter().append("path")
		 .attr("class", function (d) {
			 return "vz-halo-arc " + "halo-key_" + d.data.key
		 })
		 .on("mouseover", function (d, i) {
			 scope.dispatch.apply('arcover', viz, [this, d, i])
		 })
		 .on("mouseout", function (d, i) {
			 scope.dispatch.apply('arcout', viz, [this, d, i])
		 })
		 .merge(haloGroup);
		
		haloGroup.attr("d", function (d, i) {
			return haloArc(d, i);
		});
		
		// Store the centroids for each arc group.
		// Themes or page developers can use these stored centroids to place data tips or other information in the
		// center of the group.
		haloGroup.each(function (haloSection) {
			var angle = (haloSection.startAngle + (haloSection.endAngle - haloSection.startAngle) / 2) - 90 * radian;
			haloSection.x = innerRadius * Math.cos(angle);
			haloSection.y = innerRadius * Math.sin(angle);
		});
		
		
		var links = linkPlot.selectAll(".vz-halo-group").data(haloLayout(haloArcs));
		links.exit().remove();
		links = links.enter().append("g").attr("class", "vz-halo-group").merge(links);
		
		
		// For each arc group draw a smaller arc, path link, and node circle for each transaction within that arc.
		links.each(function (arcGroup, arcIndex) {
			
			var arc = this;
			
			// Set our new pie layout based on the start/end angles of the arc group.
			haloSliceLayout.startAngle(arcGroup.startAngle + haloLayout.padAngle()() / 1.415).endAngle(arcGroup.endAngle - haloLayout.padAngle()() / 1.415);
			
			// Create our link group
			var link = d3.select(this).selectAll(".vz-halo-link").data(haloSliceLayout(arcGroup.data.values));
			link.exit().remove();
			link = link.enter().append("g").attr("class", "vz-halo-link").merge(link);
			
			
			link.selectAll("path").remove();
			link.selectAll("circle").remove();
			
			// For each transaction arc add the link path, and node circle;
			var t = 0;
			
			link.each(function (arc) {
				var linkPath = createLinkPath(arc);
				
				// Add a circle node with a radius showing the relative link value to all links for that node.
				var node = nodeHash[scope.nodeKey(arc.data)];
				
				//Adding our link path for each slice of the arc
				var arcSlice = d3.select(this);
				arcSlice.append("path").attr("class",
				 "vz-halo-link-path node-key_" + scope.nodeKey(arc.data) + " halo-key_" + scope.haloKey(arc.data))
				 .on("mouseover", function (d, i) {
					 scope.dispatch.apply('linkover', viz, [this, d, i])
				 })
				 .on("mouseout", function (d, i) {
					 scope.dispatch.apply('linkout', viz, [this, d, i])
				 })
				 .attr("d", function (d, i) {
					 //This takes two line paths, connects them and creates an arc at the end
					 var diag = linkLayout(linkPath.arc_to_node, i);
					 diag += "L" + String(linkLayout(linkPath.node_to_arc, i)).substr(1);
					 diag += "A" + (innerRadius) + "," + (innerRadius) + " 0 0,0 " + linkPath.arc_to_node.source.x + "," + linkPath.arc_to_node.source.y;
					 return diag;
				 });
				
				// For each transaction (row in data source) we make a corresponding circle relative to the total
				// size of the node.   This is why you see various opacitys for each node
				// a more opaque node had more transactions than a more transparent one.
				node.aggregate = node.aggregate + scope.value(arc.data);
				var nodeRadius = node.aggregate / node.value * node.r;
				arcSlice.append("circle").attr("class", "vz-halo-link-node node-key_" + scope.nodeKey(arc.data) + " halo-key_" + scope.haloKey(arc.data))
				 .attr("r", 0)
				 .attr("cx", node.x - innerRadius)
				 .attr("cy", node.y - innerRadius)
				 .transition().duration(scope.duration)
				 .attr("r", nodeRadius);
				
			});
			
			// Add our path for the transaction arcs
			link.append("path").attr("class",function (d) { return "vz-halo-arc-slice node-key_" + scope.nodeKey(d.data); })
			 .attr("d",haloArc)
			 .on("mouseover",function (d,i) { scope.dispatch.apply('arcover', viz, [arc, arcGroup, arcIndex]) })
			 .on("mouseout",function (d,i) { scope.dispatch.apply('arcout(', viz, [arc, arcGroup, arcIndex]) })
			
			
		});
		
		// Tell everyone we are done with our udpate
		scope.dispatch.apply('updated', viz);
		
	}
	
	// Here we create a path element that starts at the outside arc and comes to a
	// sharp point at the circle (node) and then goes back to the outside arc.
	function createLinkPath(arcSlice) {
		
		var node = nodeHash[scope.nodeKey(arcSlice.data)]; //Get the node we are linking to
		var link = {};
		link.data = arcSlice.data;
		
		var o = {}; //Create the link from the start angle of the arc slice to the node
		o.source = {};
		o.source.x = innerRadius * Math.cos(arcSlice.startAngle - 1.57079633) //-(90 degrees)
		o.source.y = innerRadius * Math.sin(arcSlice.startAngle - 1.57079633);
		o.target = {};
		o.target.x = node.x - innerRadius;
		o.target.y = node.y - innerRadius;
		
		var p = {}; //Create a reverse link from node back to the end angle of the arc slice;
		p.target = {};
		p.target.x = innerRadius * Math.cos(arcSlice.endAngle - 1.57079633) //-(90 degrees)
		p.target.y = innerRadius * Math.sin(arcSlice.endAngle - 1.57079633);
		p.source = o.target;
		
		link.arc_to_node = o;
		link.node_to_arc = p;
		
		return link;
	}
	
	// Before we can render the data we need to perform some preparation so we can
	// organize the data to render the various geometries
	// The data should be passed in as an array of objects with the following properties
	//
	// object {
	//     value: numeric amount
	//     nodeKey: the unique identifier for the node
	//     nodeGroupKey:  the unique identifier for the group the node belongs to
	//     haloKey: the unique identifier for the halo section
	// }
	//
	// In this example we are using the halo_contribution.csv file which has the following values
	//
	//  contribution {
	//      TRANSACTION_AMT: The amount of the contribution  (size of node)
	//      CAND_ID: The unqiue candidate id (the unique node)
	//      PTY:  The candidate party affiliation (the node cluster)
	//      CMTE_ID: The committee that provided the funds for the contribution (the halo arc group)
	// }
	//
	// Each row in the data source is considered a link - as it ties together the transaction
	// to a specific candidate and committee.  Each link is shown as a path in the visual
	
	function prepData() {
		
		// Group the data by the halo keys
		haloArcs = d3.nest().key(scope.haloKey).entries(scope.data);
		// Group the nodes by the node keys
		nodes = d3.nest().key(scope.nodeKey).entries(scope.data);
		
		// Create the cluster keys for the primary node groups
		var clusterKeys = d3.nest().key(scope.nodeGroupKey).key(scope.nodeKey).entries(scope.data);
		
		// Get our totals for both the halo groups and the nodes
		sumGroup(haloArcs);
		sumGroup(nodes);
		
		// Create a hash so for each unique node id we associate all transactions with it
		// i.e. for each Candidate we attach each contribution.
		nodeHash = [];
		nodes.forEach(function (d) {
			d.nodeGroup = scope.nodeGroupKey(d.values[0]);
			nodeHash[scope.nodeKey(d.values[0])] = d;
		});
		
		// Create the unique node clusters
		// i.e. Republican, Democrat, Indepdendent
		clusters = [];
		clusterKeys.forEach(function (d, i) {
			var o = {};
			o.id = d.key;
			o.values = nodes.filter(function (n) {
				return (d.key == n.nodeGroup)
			});
			o.children = o.values;
			clusters.push(o);
		});
		
		// Sum the total of the clusters
		sumGroup(clusters, "value");
		
	}
	
	// A utility function that sums the values within a group.
	function sumGroup(group, key) {
		group.forEach(function (d) {
			var sum = 0;
			d.values.forEach(function (o) {
				if (key) {
					sum += Number(o[key]);
				}
				else {
					sum += Number(scope.value(o));
				}
			});
			d.value = sum;
		});
	}
	
	/**
	 *  Triggers the render pipeline process to refresh the component on the screen.
	 *  @method vizuly2.viz.Halo.update
	 */
	viz.update = function () {
		update();
		return viz;
	};
	
	// styless and styles
	var stylesCallbacks = [
		{on: 'updated.styles', callback: applyStyles},
		{on: "nodeover.styles",callback: styles_NodeOnMouseOver},
		{on: "nodeout.styles",callback: styles_onMouseOut},
		{on: "arcover.styles",callback: styles_ArcOnMouseOver},
		{on: "arcout.styles",callback: styles_onMouseOut},
		{on: "linkover.styles",callback: styles_LinkOnMouseOver},
		{on: "linkout.styles",callback: styles_onMouseOut}
	];
	
	viz.applyCallbacks(stylesCallbacks);
	
	function applyStyles() {
		
		// If we don't have a styles we want to exit - as there is nothing we can do.
		if (!scope.styles || scope.styles == null) return;
		
		// The width and height of the viz
		var w = size.measuredWidth;
		var h = size.measuredHeight;
		
		var r = Math.min(w,h);
		
		var nodeStrokeScale = d3.scaleLinear().domain([0,r/20]).range([0,r/80]);
		
		// Grab the d3.selection from the viz so we can operate on it.
		var selection = scope.selection;
		
		var styles_backgroundGradient = vizuly2.svg.gradient.blend(viz, viz.getStyle('background-color-bottom'), viz.getStyle('background-color-top'));
		
		// Update the background
		selection.selectAll(".vz-background").style("fill", function () {
			 return "url(#" + styles_backgroundGradient.attr("id") + ")";
		 })
		 .style('opacity',viz.getStyle('background-opacity'));
		
		// Hide the plot background
		selection.selectAll(".vz-plot-background").style("opacity", 0);
		
		// Style the link paths
		selection.selectAll(".vz-halo-link-path")
		 .style("fill",function (d,i) { return viz.getStyle('link-fill',arguments) })
		 .style("fill-opacity", function (d,i) { return viz.getStyle('link-fill-opacity', arguments) })
		 .style("stroke",function (d,i) { return viz.getStyle('link-stroke', arguments) })
		 .style("stroke-opacity", function (d,i) { return viz.getStyle('link-stroke-opacity', arguments )})
		
		// Style the link nodes (smaller ones)
		selection.selectAll(".vz-halo-link-node")
		 .style("fill",function (d,i) { return viz.getStyle('link-fill', arguments) })
		 .style("fill-opacity",function (d,i) { return viz.getStyle('link-node-fill-opacity', arguments) })
		 .style("stroke-opacity",function (d,i) { return viz.getStyle('node-stroke-opacity', arguments) });
		
		// Style the main nodes
		selection.selectAll(".vz-halo-node")
		 .style("fill",function (d,i) { return viz.getStyle('node-fill', arguments) })
		 .style("fill-opacity",function (d,i) { return viz.getStyle('node-fill-opacity', arguments) })
		 .style("stroke",function (d,i) { return viz.getStyle('node-stroke', arguments) })
		 .style("stroke-opacity",function (d,i) { return viz.getStyle('node-stroke-opacity', arguments) })
		 .style("stroke-width",function (d,i) { return nodeStrokeScale(d.r) });
		
		// Style the arc slices
		selection.selectAll(".vz-halo-arc-slice")
		 .style("fill",function (d,i) { return viz.getStyle('arc-fill', arguments) })
		 .style("fill-opacity",function (d,i) { return viz.getStyle('arc-slice-fill-opacity', arguments) })
		
		// Style the main arcs
		selection.selectAll(".vz-halo-arc")
		 .style("fill",function (d,i) { return viz.getStyle('arc-fill', arguments) })
		 .style("fill-opacity", function (d,i) { return viz.getStyle('arc-fill-opacity', arguments) });
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	function styles_restoreElements() {
		haloPlot.selectAll(".vz-halo-label").remove();
		viz.removeDataTip();
		applyStyles();
	}
	
	function styles_NodeOnMouseOver(e, d, i) {
		// demphasize all elements
		styles_fadeElements();
		
		// For each link associated with the node, highlight all arc slices
		var links=scope.selection.selectAll(".vz-halo-link-path.node-key_" + d.key);
		links.each(function (d) {
			var arc=scope.selection.selectAll(".vz-halo-arc.halo-key_" + scope.haloKey(d.data));
			var arcDatum = arc.datum();
			var arcTotal = d3.sum(arcDatum.data.values.filter(function (val) { return scope.nodeKey(val) == scope.nodeKey(d.data)}), function (val) { return scope.value(val)})
			styles_highlightArc(arc);
			styles_arcLabelRenderer(arcDatum.x, arcDatum.y, scope.haloLabel(arcDatum.data.values[0]), scope.valueFormatter(arcTotal))
		});
		
		// Highlight all links associated with the node.
		styles_highlightLink(links);
		
		// Highlight all arc slices associated with the node
		styles_highlightArcSlice(viz.selection().selectAll(".vz-halo-arc-slice.node-key_" + d.key));
		
		// Highlight the node itself.
		styles_highlightLinkNode(viz.selection().selectAll(".vz-halo-node.node-key_" + d.key));
		
		viz.showDataTip(e, d);
		
	}
	
	// Each time the user mouses over a halo arc group this fires
	function styles_ArcOnMouseOver(e,d,i) {
		
		// demphasize all elements
		styles_fadeElements();
		
		// Highlight relevant elements associated with the halo arc group.
		styles_highlightArc(d3.select(e));
		styles_highlightLink(scope.selection.selectAll(".vz-halo-link-path.halo-key_" + d.data.key));
		d.data.values.forEach(function (d) {
			styles_highlightNode(scope.selection.selectAll(".vz-halo-node.node-key_" + scope.nodeKey(d)));
		});
		
		styles_arcLabelRenderer(d.x, d.y, scope.haloLabel(d.data.values[0]), scope.valueFormatter(d.value))
		
	}
	
	// Fires each time the user mouses over a link path
	function styles_LinkOnMouseOver(e, d, i) {
		
		// demphasize all elements
		styles_fadeElements();
		
		// Highlight all nodes, arcs, and arc slices associated with the links.
		styles_highlightLink(d3.select(e.parentNode).selectAll(".vz-halo-link-path"));
		styles_highlightArc(scope.selection.selectAll(".vz-halo-arc.halo-key_" + scope.haloKey(d.data)));
		styles_highlightArcSlice(d3.select(e.parentNode).selectAll(".vz-halo-arc-slice"));
		styles_highlightNodeStroke(scope.selection.selectAll(".vz-halo-node.node-key_" + scope.nodeKey(d.data)));
		styles_highlightLinkNode(d3.select(e.parentNode).selectAll("circle"));
		
		var arcDatum=scope.selection.selectAll(".vz-halo-arc.halo-key_" + scope.haloKey(d.data)).datum();
		styles_arcLabelRenderer(arcDatum.x, arcDatum.y, scope.haloLabel(arcDatum.data.values[0]));
		
		var node = scope.selection.selectAll('.vz-halo-node.node-key_' + scope.nodeKey(d.data));
		
		viz.showDataTip(node.nodes()[0],d)
		
	}
	
	
	//On <coce>mouseout</code> we want to undo any changes we made on the <code>mouseover</code>.
	function styles_onMouseOut(bar, d, i) {
		styles_restoreElements();
	}
	
	// demphasizes all elements
	function styles_fadeElements() {
		scope.selection.selectAll(".vz-halo-node").style("fill-opacity",.25).style("stroke-opacity",.05);
		scope.selection.selectAll(".vz-halo-link-node").style("fill-opacity",0);
		scope.selection.selectAll(".vz-halo-link-path").style("fill-opacity",.025).style('stroke-opacity',0);
	}
	
	function styles_highlightLink(selection) {
		selection.style("fill-opacity",.6).style("stroke-opacity",.25);
	}
	
	function styles_highlightNodeStroke(selection) {
		selection.style("stroke-opacity",.8).style("stroke",function (d,i) { return viz.getStyle('node-stroke-over', arguments) });
	}
	
	
	function styles_highlightNode(selection) {
		selection.style("fill-opacity",.9).style("stroke-opacity",.75).style("stroke",function (d,i) { return viz.getStyle('node-stroke-over', arguments) });
	}
	
	function styles_highlightLinkNode(selection) {
		selection.style("fill-opacity",.85)
		 .style("stroke-opacity",.85)
		 .style("stroke",function (d,i) { return viz.getStyle('node-stroke-over', arguments) });
	}
	
	function styles_highlightArcSlice(selection) {
		selection.style("fill-opacity",.8).style("stroke-opacity",.8);
	}
	
	function styles_highlightArc(selection) {
		selection.style("fill-opacity",.65)
		 .style("stroke-opacity",.8)
		 .style("fill",function (d,i) { return viz.getStyle('arc-fill-over', arguments) });
	}
	
	
	function styles_arcLabelRenderer (x, y, label1, label2) {
		
		var g = scope.selection.selectAll(".vz-halo-arc-plot").append("g")
		 .attr("class","vz-halo-label")
		 .style("pointer-events","none")
		 .style("opacity",0);
		
		g.append("text")
		 .style("font-size","11px")
		 .style("fill",viz.getStyle('label-color'))
		 .style("fill-opacity",.75)
		 .attr("text-anchor","middle")
		 .attr("x", x)
		 .attr("y", y)
		 .text(label1);
		
		if (label2) {
			g.append("text")
			 .style("font-size","11px")
			 .style("fill",viz.getStyle('label-color'))
			 .style("fill-opacity",.75)
			 .attr("text-anchor","middle")
			 .attr("x", x)
			 .attr("y", y + 20)
			 .text(label2);
		}
		
		var rect = g.nodes()[0].getBoundingClientRect();
		g.insert("rect","text")
		 .style("shape-rendering","auto")
		 .style("fill",viz.getStyle('label-background'))
		 .style("opacity",function (d,i) { return viz.getStyle('label-fill-opacity',arguments) })
		 .attr("width",rect.width+12)
		 .attr("height",rect.height+12)
		 .attr("rx",3)
		 .attr("ry",3)
		 .attr("x", x-5 - rect.width/2)
		 .attr("y", y - 16);
		
		g.transition().style("opacity",1);
		
	}
	
	function dataTipRenderer(tip, e, d, i, j, x, y) {
		
		var html = '<div class="vz-tip-header1">HEADER1</div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header2"> HEADER2 </div>' +
		 '<div class="vz-tip-header-rule"></div>' +
		 '<div class="vz-tip-header3"> HEADER3 </div>';
		
		var h1 = scope.nodeGroupLabel(d.values ? d.values[0] : d.data);
		var h2 = scope.nodeLabel(d.values ? d.values[0] : d.data);
		var h3 = scope.valueFormatter(d.value);
		
		html = html.replace("HEADER1", h1);
		html = html.replace("HEADER2", h2);
		html = html.replace("HEADER3", h3);
		
		tip.style('width','225px').style('height','80px').html(html);
		
		return [(Number(x) - 110),y - 90 - d.r]
		
	}
	
	return viz;
	
};