/*
 Copyright (c) 2016, BrightPoint Consulting, Inc.
 
 This source code is covered under the following license: http://vizuly2.io/commercial-license/
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// @version 2.1.220

vizuly2.viz.Generic = function (parent) {
	
	var d3 = vizuly2.d3;
	
	var properties = {
		'data': null,
		'margin': {
			'top': 10,
			'bottom': 10,
			'left': 10,
			'right': 10
		},
		'width': 300,
		'height': 300,
		'duration': 500,
		'dataTipRenderer' : dataTipRenderer
	};
	
	var styles = {
		'background-opacity': 1,
		'background-color-top': '#EEE',
		'background-color-bottom': '#CCC'
	};
	
	var events = ['mouseover','mouseout','click'];
	
	var scope = {};
	
	scope.initialize = initialize;
	scope.properties = properties;
	scope.styles = styles;
	scope.events = events;
	
	// Create our viz and type it
	var viz = vizuly2.core.component(parent, scope);
	viz.version = '2.1.220';
	
	var size;           // Holds the 'size' variable as defined in viz.util.size()
	
	// These are all d3.selection objects we use to insert and update svg elements into
	var svg, plot, background, defs;
	
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.util.getDefs(viz);
		plot = svg.append('g');
		
		scope.dispatch.apply('initialized', viz);
	}
	
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		scope.size = size;
		
		// Tell everyone we are done making our measurements
		scope.dispatch.apply('measured', viz);
		
	}
	
	// The update function is the primary function that is called when we want to render the visualiation based on
	// all of its set properties.  A developer can change propertys of the components and it will not show on the screen
	// until the update function is called
	function update() {
		
		// Call measure each time before we update to make sure all our our layout properties are set correctly
		measure();
		
		// Layout all of our primary SVG d3.elements.
		svg.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		background.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		plot.attr('transform','translate(' + size.left + ',' + size.top + ')')
		
		scope.dispatch.apply('updated', viz);
		
	}
	
	/**
	 *  Triggers the render pipeline process to refresh the component on the screen.
	 *  @method  vizuly2.viz.Generic.update
	 */
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
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	
	function styles_onMouseOver(e,d,i) {
	
	}
	
	function styles_onMouseOut(e,d,i) {
	
	}
	
	function dataTipRenderer(tip, e, d, i, j, x, y) {
		
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
	
	;
	
	// Returns our viz component :)
	return viz;
}