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
vizuly2.viz.WordCloud = function (parent) {
	
	var d3 = vizuly2.d3;
	var d3v3 = vizuly2.d3v3;
	
	var properties = {
		"data": null,
		"margin": {                            // Our margin object
			"top": "10%",                       // Top margin
			"bottom": "10%",                    // Bottom margin
			"left": "10%",                      // Left margin
			"right": "10%"                      // Right margin
		},
		"width": 300,                          // Overall width of component
		"height": 300,                     // Height of component
		"hideWords": "i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall",          // Remove these words from results
		"showNumbers": false,
		"fontSizeMax": 30,
		"fontSizeMin": 10
	};
	
	var styles = {
		'background-color-top': '#FFF',
		'background-color-bottom': '#DDD',
		'text-fill-colors': [ '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'],
		'text-color': function (d,i) { var colors = this.getStyle('text-fill-colors'); return colors[i % colors.length] },
		'font-family': 'Impact'
	}
	
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
		defs = vizuly2.core.util.getDefs(viz);
		plot = svg.append('g')
		
		wordLayout.on('end', updateCloud);
		
		scope.dispatch.apply('initialized', viz);
	}
	
	
	// The measure function performs any measurement or layout calcuations prior to making any updates to the SVG elements
	function measure() {
		
		// Call our validate routine and make sure all component properties have been set
		viz.validate();
		
		// Get our size based on height, width, and margin
		size = vizuly2.core.util.size(scope.margin, scope.width, scope.height, scope.parent);
		
		var wordHash = {};
		
		var words = scope.data.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
		if (words.length == 1){
			wordHash[words[0]] = 1;
		} else {
			words.forEach(function(word){
				var word = word.toLowerCase();
				if (word != "" && scope.hideWords.indexOf(word)==-1 && word.length>1 && (scope.showNumbers == false && isNaN(Number(word)))){
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
		 .range([scope.fontSizeMin,scope.fontSizeMax]);
		
		wordLayout
		 .words(wordEntries)
		 .text(function (d) { return d.key })
		 .size([size.width, size.height])
		 .rotate(function() { return ~~(Math.random() * 2) * 90; })
		 .timeInterval(20)
		 .font(viz.getStyle('font-family'))
		 .fontSize(function(d) { return fontScale(+d.value); } )
		
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
		{on: 'mouseout.styles', callback: styles_onMouseOut}
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
		
		plot.selectAll('.vz-wordcloud-word')
		 .style('fill',function (d,i) { return viz.getStyle('text-color', arguments) })
		 .style("font-size", function(d) { return fontScale(d.value) + "px"; })
		 .style("font-family", "Impact");
		
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

	
	// Returns our viz component :)
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