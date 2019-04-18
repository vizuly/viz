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

// @version 2.1.159

/**
 * @class
 */
vizuly2.viz.WordCloud = function (parent) {
	
	var d3 = vizuly2.d3;
	var d3v3 = vizuly2.d3v3;
	
	/** @lends vizuly2.viz.WordCloud.properties */
	var properties = {
		/**
		 * String containing words that will be used to generate word cloud
		 * @member {String}
		 * @default Needs to be set at runtime
		 * @example
		 * "Of course that’s your contention. You’re a first year grad student. You just got finished readin’ some Marxian historian, Pete Garrison probably. You’re gonna be convinced of that ’til next month when you get to James Lemon and then you’re gonna be talkin’ about how the economies of Virginia and Pennsylvania were entrepreneurial and capitalist way back in 1740. That’s gonna last until next year. You’re gonna be in here regurgitating Gordon Wood, talkin’ about, you know, the Pre-Revolutionary utopia and the capital-forming effects of military mobilization… ‘Wood drastically underestimates the impact of social distinctions predicated upon wealth, especially inherited wealth.’ You got that from Vickers, Work in Essex County, page 98, right? Yeah, I read that, too. Were you gonna plagiarize the whole thing for us? Do you have any thoughts of your own on this matter? Or do you, is that your thing? You come into a bar. You read some obscure passage and then pretend, you pawn it off as your own, as your own idea just to impress some girls and embarrass my friend? See, the sad thing about a guy like you is in 50 years, you’re gonna start doin’ some thinkin’ on your own and you’re gonna come up with the fact that there are two certainties in life. One: don’t do that. And two: you dropped a hundred and fifty grand on a fuckin’ education you coulda got for a dollar fifty in late charges at the public library.";
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
		 * Words that won't be displayed in word cloud. Passed in as a comma-delimited string.
		 * @member {String}
		 * @default  "i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall"
		 */
		'hideWords': "i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall",
		/**
		 * Determines whether to show any numerals within the word cloud
		 * @member {Boolean}
		 * @default  false
		 */
		'showNumerals': false,
		/**
		 * Function that returns maximum font size to use.
		 * @member {Function}
		 * @default  function () { return Math.min(size.width, size.height)/10 }
		 */
		'fontSizeMax': function () { return Math.min(size.width, size.height)/10 },
		/**
		 * Function that returns minimum font size to use.
		 * @member {Function}
		 * @default  function () { return Math.min(size.width, size.height)/40 }
		 */
		'fontSizeMin': function () { return Math.min(size.width, size.height)/40 }
	};
	
	var styles = {
		'background-opacity': 1,
		'background-color-top': '#FFF',
		'background-color-bottom': '#DDD',
		'label-fill': function (d,i) {
			var colors = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];
			return colors[i % colors.length]
		},
		'label-fill-opacity': 1,
		'font-family': 'Anton'
	}
	
	/** @lends vizuly2.viz.WordCloud.events */
	var events = [
		/**
		 * Fires when user moves the mouse over a word.
		 * @event vizuly2.viz.WordCloud.mouseover
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseover', function (e, d, i) { ... });
		 */
		'mouseover',
		/**
		 * Fires when user moves the mouse off a word.
		 * @event vizuly2.viz.WordCloud.mouseout
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('mouseout', function (e, d, i) { ... });
		 */
		'mouseout',
		/**
		 * Fires when user clicks a word.
		 * @event vizuly2.viz.WordCloud.click
		 * @type {VizulyEvent}
		 * @param e - DOM element that fired event
		 * @param d - Datum associated with DOM element
		 * @param i - Index of datum in display series
		 * @param this -  Vizuly Component that emitted event
		 * @example  viz.on('click', function (e, d, i) { ... });
		 */
		'click'
	]
	
	var events = ['mouseover', 'mouseout', 'click']
	
	// This is the object that provides pseudo "protected" properties that the vizuly.viz function helps create
	var scope = {};
	scope.initialize = initialize;
	scope.properties = properties;
	scope.styles = styles;
	scope.events = events;
	
	// Create our Vizuly component
	var viz = vizuly2.core.component(parent, scope);
	
	var size;           // Holds the 'size' variable as defined in viz.util.size()
	
	// These are all d3.selection objects we use to insert and update svg elements into
	var svg, plot, background, defs;
	
	var wordLayout = cloudLayout();
	
	var fontScale = d3.scaleLinear();
	
	
	// Here we set up all of our svg layout elements using a 'vz-XX' class namespace.  This routine is only called once
	// These are all place holder groups for the invidual data driven display elements.   We use these to do general
	// sizing and margin layout.  The all are referenced as d3.selections.
	function initialize() {
		
		svg = scope.selection.append("svg").attr("id", scope.id).style("overflow", "visible").attr("class", "vizuly");
		background = svg.append("rect").attr("class", "vz-background");
		defs = vizuly2.util.getDefs(viz);
		plot = svg.append('g')
		
		wordLayout.on('end', updateCloud);
		
		scope.dispatch.apply('initialized', viz);
	}
	
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		var wordHash = {};
		
		console.log('size.width = ' + size.width)
		
		var words = scope.data.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
		if (words.length == 1){
			wordHash[words[0]] = 1;
		} else {
			words.forEach(function(word){
				var word = word.toLowerCase();
				var isNumber = !isNaN(Number(word));
				var numberCondition = (scope.showNumerals === true && isNumber === true) || isNumber === false;
				
				if ((word != "" && scope.hideWords.indexOf(word) == -1) && numberCondition ){
					if (wordHash[word]){
						wordHash[word]++;
					} else {
						wordHash[word] = 1;
					}
				}
			})
		}
		
		var wordEntries = d3.entries(wordHash);
		
		fontScale.domain([0, d3.max(wordEntries, function(d) { return d.value; })])
		 .range([scope.fontSizeMin(),scope.fontSizeMax()]);
		
		wordLayout
		 .words(wordEntries)
		 .text(function (d) { return d.key })
		 .size([size.width, size.height])
		 .rotate(function() { return ~~(Math.random() * 2) * 90; })
		 .timeInterval(20)
		 .font(viz.getStyle('font-family'))
		 .fontSize(function(d) { return fontScale(+d.value); } )
		
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
		
		plot.selectAll('text').remove();
		
		wordLayout.start();
		
		// Layout all of our primary SVG d3.elements.
		svg.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		background.attr("width", size.measuredWidth).attr("height", size.measuredHeight);
		plot.attr('transform', 'translate(' + (size.width/2 + size.left) + ',' + (size.height/2 + size.top) + ')')
		
	}
	
	function updateCloud(keyWords) {
		console.log('updateCloud')
		var words = plot.selectAll('text')
		 .data(keyWords);
		
		words.enter().append("text")
		 .attr('class','vz-wordcloud-word')
		 .attr("text-anchor", "middle")
		 .attr("transform", function(d) {return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
		 .text(function(d) { return d.key; })
		 .style('cursor','pointer')
		 .on("mouseover",function (d,i) { scope.dispatch.apply('mouseover',viz,[this, d, i])})
		 .on("mouseout",function (d,i) { scope.dispatch.apply('mouseout',viz,[this, d, i])})
		 .on("click",function (d,i) { scope.dispatch.apply('click',viz,[this, d, i])});
		
		scope.dispatch.apply('updated', viz);
	}
	
	/**
	 *  Triggers the render pipeline process to refresh the component on the screen.
	 * @method vizuly2.viz.WordCloud.update
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
		
		plot.selectAll('.vz-wordcloud-word')
		 .style('fill',function (d,i) { return viz.getStyle('label-fill', arguments) })
		 .style('fill-opacity',function (d,i) { return viz.getStyle('label-fill-opacity', arguments) })
		 .style("font-size", function(d) { return fontScale(d.value) + "px"; })
		 .style("font-family", function (d,i) { return viz.getStyle('font-family', arguments); })
		
		scope.dispatch.apply('styled', viz);
		
	}
	
	
	function styles_onMouseOver(e,d,i) {
		fadeElements();
		d3.select(e).transition('fade').style('opacity',1)
	}
	
	function styles_onMouseOut(e,d,i) {
		restoreElements();
	}
	
	function fadeElements() {
		plot.selectAll('.vz-wordcloud-word').transition('fade').style('opacity',0.1)
	}
	
	function restoreElements() {
		plot.selectAll('.vz-wordcloud-word').transition('fade').style('opacity',1)
	}

	
	// Returns our viz component
	return viz;
	
	// Word cloud layout by Jason Davies, http://www.jasondavies.com/word-cloud/
	// Algorithm due to Jonathan Feinberg, http://static.mrfeinberg.com/bv_ch03.pdf
	
	function cloudLayout() {
		/*
			Copyright (c) 2013, Jason Davies.
			All rights reserved.
			
			Redistribution and use in source and binary forms, with or without
			modification, are permitted provided that the following conditions are met:
			
			  * Redistributions of source code must retain the above copyright notice, this
			    list of conditions and the following disclaimer.
			
			  * Redistributions in binary form must reproduce the above copyright notice,
			    this list of conditions and the following disclaimer in the documentation
			    and/or other materials provided with the distribution.
			
			  * The name Jason Davies may not be used to endorse or promote products
			    derived from this software without specific prior written permission.
			
			THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
			ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
			WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
			DISCLAIMED. IN NO EVENT SHALL JASON DAVIES BE LIABLE FOR ANY DIRECT, INDIRECT,
			INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
			LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
			PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
			LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
			OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
			ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */
		
		function cloud() {
			var size = [256, 256],
			 text = cloudText,
			 font = cloudFont,
			 fontSize = cloudFontSize,
			 fontStyle = cloudFontNormal,
			 fontWeight = cloudFontNormal,
			 rotate = cloudRotate,
			 padding = cloudPadding,
			 spiral = archimedeanSpiral,
			 words = [],
			 timeInterval = Infinity,
			 event = d3.dispatch("word", "end"),
			 timer = null,
			 cloud = {};
			
			cloud.start = function() {
				var board = zeroArray((size[0] >> 5) * size[1]),
				 bounds = null,
				 n = words.length,
				 i = -1,
				 tags = [],
				 data = words.map(function(d, i) {
					 d.text = text.call(this, d, i);
					 d.font = font.call(this, d, i);
					 d.style = fontStyle.call(this, d, i);
					 d.weight = fontWeight.call(this, d, i);
					 d.rotate = rotate.call(this, d, i);
					 d.size = ~~fontSize.call(this, d, i);
					 d.padding = padding.call(this, d, i);
					 return d;
				 }).sort(function(a, b) { return b.size - a.size; });
				
				if (timer) clearInterval(timer);
				timer = setInterval(step, 0);
				step();
				
				return cloud;
				
				function step() {
					var start = +new Date,
					 d;
					while (+new Date - start < timeInterval && ++i < n && timer) {
						d = data[i];
						d.x = (size[0] * (Math.random() + .5)) >> 1;
						d.y = (size[1] * (Math.random() + .5)) >> 1;
						cloudSprite(d, data, i);
						if (d.hasText && place(board, d, bounds)) {
							tags.push(d);
							event.apply('word', viz, [d]);
							if (bounds) cloudBounds(bounds, d);
							else bounds = [{x: d.x + d.x0, y: d.y + d.y0}, {x: d.x + d.x1, y: d.y + d.y1}];
							// Temporary hack
							d.x -= size[0] >> 1;
							d.y -= size[1] >> 1;
						}
					}
					if (i >= n) {
						cloud.stop();
						event.apply('end',viz,[tags, bounds]);
					}
				}
			}
			
			cloud.stop = function() {
				if (timer) {
					clearInterval(timer);
					timer = null;
				}
				return cloud;
			};
			
			cloud.timeInterval = function(x) {
				if (!arguments.length) return timeInterval;
				timeInterval = x == null ? Infinity : x;
				return cloud;
			};
			
			function place(board, tag, bounds) {
				var perimeter = [{x: 0, y: 0}, {x: size[0], y: size[1]}],
				 startX = tag.x,
				 startY = tag.y,
				 maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]),
				 s = spiral(size),
				 dt = Math.random() < .5 ? 1 : -1,
				 t = -dt,
				 dxdy,
				 dx,
				 dy;
				
				while (dxdy = s(t += dt)) {
					dx = ~~dxdy[0];
					dy = ~~dxdy[1];
					
					if (Math.min(dx, dy) > maxDelta) break;
					
					tag.x = startX + dx;
					tag.y = startY + dy;
					
					if (tag.x + tag.x0 < 0 || tag.y + tag.y0 < 0 ||
					 tag.x + tag.x1 > size[0] || tag.y + tag.y1 > size[1]) continue;
					// TODO only check for collisions within current bounds.
					if (!bounds || !cloudCollide(tag, board, size[0])) {
						if (!bounds || collideRects(tag, bounds)) {
							var sprite = tag.sprite,
							 w = tag.width >> 5,
							 sw = size[0] >> 5,
							 lx = tag.x - (w << 4),
							 sx = lx & 0x7f,
							 msx = 32 - sx,
							 h = tag.y1 - tag.y0,
							 x = (tag.y + tag.y0) * sw + (lx >> 5),
							 last;
							for (var j = 0; j < h; j++) {
								last = 0;
								for (var i = 0; i <= w; i++) {
									board[x + i] |= (last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0);
								}
								x += sw;
							}
							delete tag.sprite;
							return true;
						}
					}
				}
				return false;
			}
			
			cloud.words = function(x) {
				if (!arguments.length) return words;
				words = x;
				return cloud;
			};
			
			cloud.size = function(x) {
				if (!arguments.length) return size;
				size = [+x[0], +x[1]];
				return cloud;
			};
			
			cloud.font = function(x) {
				if (!arguments.length) return font;
				font = d3v3.functor(x);
				return cloud;
			};
			
			cloud.fontStyle = function(x) {
				if (!arguments.length) return fontStyle;
				fontStyle = d3v3.functor(x);
				return cloud;
			};
			
			cloud.fontWeight = function(x) {
				if (!arguments.length) return fontWeight;
				fontWeight = d3v3.functor(x);
				return cloud;
			};
			
			cloud.rotate = function(x) {
				if (!arguments.length) return rotate;
				rotate = d3v3.functor(x);
				return cloud;
			};
			
			cloud.text = function(x) {
				if (!arguments.length) return text;
				text = d3v3.functor(x);
				return cloud;
			};
			
			cloud.spiral = function(x) {
				if (!arguments.length) return spiral;
				spiral = spirals[x + ""] || x;
				return cloud;
			};
			
			cloud.fontSize = function(x) {
				if (!arguments.length) return fontSize;
				fontSize = d3v3.functor(x);
				return cloud;
			};
			
			cloud.padding = function(x) {
				if (!arguments.length) return padding;
				padding = d3v3.functor(x);
				return cloud;
			};
			
			return d3v3.rebind(cloud, event, "on");
		}
		
		function cloudText(d) {
			return d.text;
		}
		
		function cloudFont() {
			return "serif";
		}
		
		function cloudFontNormal() {
			return "normal";
		}
		
		function cloudFontSize(d) {
			return Math.sqrt(d.value);
		}
		
		function cloudRotate() {
			return (~~(Math.random() * 6) - 3) * 30;
		}
		
		function cloudPadding() {
			return 1;
		}
		
		// Fetches a monochrome sprite bitmap for the specified text.
		// Load in batches for speed.
		function cloudSprite(d, data, di) {
			if (d.sprite) return;
			c.clearRect(0, 0, (cw << 5) / ratio, ch / ratio);
			var x = 0,
			 y = 0,
			 maxh = 0,
			 n = data.length;
			--di;
			while (++di < n) {
				d = data[di];
				c.save();
				c.font = d.style + " " + d.weight + " " + ~~((d.size + 1) / ratio) + "px " + d.font;
				var w = c.measureText(d.text + "m").width * ratio,
				 h = d.size << 1;
				if (d.rotate) {
					var sr = Math.sin(d.rotate * cloudRadians),
					 cr = Math.cos(d.rotate * cloudRadians),
					 wcr = w * cr,
					 wsr = w * sr,
					 hcr = h * cr,
					 hsr = h * sr;
					w = (Math.max(Math.abs(wcr + hsr), Math.abs(wcr - hsr)) + 0x1f) >> 5 << 5;
					h = ~~Math.max(Math.abs(wsr + hcr), Math.abs(wsr - hcr));
				} else {
					w = (w + 0x1f) >> 5 << 5;
				}
				if (h > maxh) maxh = h;
				if (x + w >= (cw << 5)) {
					x = 0;
					y += maxh;
					maxh = 0;
				}
				if (y + h >= ch) break;
				c.translate((x + (w >> 1)) / ratio, (y + (h >> 1)) / ratio);
				if (d.rotate) c.rotate(d.rotate * cloudRadians);
				c.fillText(d.text, 0, 0);
				if (d.padding) c.lineWidth = 2 * d.padding, c.strokeText(d.text, 0, 0);
				c.restore();
				d.width = w;
				d.height = h;
				d.xoff = x;
				d.yoff = y;
				d.x1 = w >> 1;
				d.y1 = h >> 1;
				d.x0 = -d.x1;
				d.y0 = -d.y1;
				d.hasText = true;
				x += w;
			}
			var pixels = c.getImageData(0, 0, (cw << 5) / ratio, ch / ratio).data,
			 sprite = [];
			while (--di >= 0) {
				d = data[di];
				if (!d.hasText) continue;
				var w = d.width,
				 w32 = w >> 5,
				 h = d.y1 - d.y0;
				// Zero the buffer
				for (var i = 0; i < h * w32; i++) sprite[i] = 0;
				x = d.xoff;
				if (x == null) return;
				y = d.yoff;
				var seen = 0,
				 seenRow = -1;
				for (var j = 0; j < h; j++) {
					for (var i = 0; i < w; i++) {
						var k = w32 * j + (i >> 5),
						 m = pixels[((y + j) * (cw << 5) + (x + i)) << 2] ? 1 << (31 - (i % 32)) : 0;
						sprite[k] |= m;
						seen |= m;
					}
					if (seen) seenRow = j;
					else {
						d.y0++;
						h--;
						j--;
						y++;
					}
				}
				d.y1 = d.y0 + seenRow;
				d.sprite = sprite.slice(0, (d.y1 - d.y0) * w32);
			}
		}
		
		// Use mask-based collision detection.
		function cloudCollide(tag, board, sw) {
			sw >>= 5;
			var sprite = tag.sprite,
			 w = tag.width >> 5,
			 lx = tag.x - (w << 4),
			 sx = lx & 0x7f,
			 msx = 32 - sx,
			 h = tag.y1 - tag.y0,
			 x = (tag.y + tag.y0) * sw + (lx >> 5),
			 last;
			for (var j = 0; j < h; j++) {
				last = 0;
				for (var i = 0; i <= w; i++) {
					if (((last << msx) | (i < w ? (last = sprite[j * w + i]) >>> sx : 0))
					 & board[x + i]) return true;
				}
				x += sw;
			}
			return false;
		}
		
		function cloudBounds(bounds, d) {
			var b0 = bounds[0],
			 b1 = bounds[1];
			if (d.x + d.x0 < b0.x) b0.x = d.x + d.x0;
			if (d.y + d.y0 < b0.y) b0.y = d.y + d.y0;
			if (d.x + d.x1 > b1.x) b1.x = d.x + d.x1;
			if (d.y + d.y1 > b1.y) b1.y = d.y + d.y1;
		}
		
		function collideRects(a, b) {
			return a.x + a.x1 > b[0].x && a.x + a.x0 < b[1].x && a.y + a.y1 > b[0].y && a.y + a.y0 < b[1].y;
		}
		
		function archimedeanSpiral(size) {
			var e = size[0] / size[1];
			return function(t) {
				return [e * (t *= .1) * Math.cos(t), t * Math.sin(t)];
			};
		}
		
		function rectangularSpiral(size) {
			var dy = 4,
			 dx = dy * size[0] / size[1],
			 x = 0,
			 y = 0;
			return function(t) {
				var sign = t < 0 ? -1 : 1;
				// See triangular numbers: T_n = n * (n + 1) / 2.
				switch ((Math.sqrt(1 + 4 * sign * t) - sign) & 3) {
					case 0:  x += dx; break;
					case 1:  y += dy; break;
					case 2:  x -= dx; break;
					default: y -= dy; break;
				}
				return [x, y];
			};
		}
		
		// TODO reuse arrays?
		function zeroArray(n) {
			var a = [],
			 i = -1;
			while (++i < n) a[i] = 0;
			return a;
		}
		
		var cloudRadians = Math.PI / 180,
		 cw = 1 << 11 >> 5,
		 ch = 1 << 11,
		 canvas,
		 ratio = 1;
		
		if (typeof document !== "undefined") {
			canvas = document.createElement("canvas");
			canvas.width = 1;
			canvas.height = 1;
			ratio = Math.sqrt(canvas.getContext("2d").getImageData(0, 0, 1, 1).data.length >> 2);
			canvas.width = (cw << 5) / ratio;
			canvas.height = ch / ratio;
		} else {
			// Attempt to use node-canvas.
			canvas = new Canvas(cw << 5, ch);
		}
		
		var c = canvas.getContext("2d"),
		 spirals = {
			 archimedean: archimedeanSpiral,
			 rectangular: rectangularSpiral
		 };
		c.fillStyle = c.strokeStyle = "red";
		c.textAlign = "center";
		
		return cloud();
	};
	
}