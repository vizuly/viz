(function($) {
	
	var styles;
	
	$.fn.menumaker = function(options) {

		var cssmenu = $(this), settings = $.extend({
			title: "Menu",
			format: "dropdown",
			sticky: false
		}, options);

		return this.each(function() {
			cssmenu.prepend('<div id="menu-button"><span id="vizuly-logo"><img src="demo/scripts/vizuly_logo_16x16.png" class="logo">' + settings.title + '</span></div>');
			//cssmenu.prepend('<div id="menu-button">' + settings.title + '</div>');

			$(this).find("#menu-button").on('click', function(){
				toggleMenu(this);
			});

			function toggleMenu(button) {
				button=cssmenu.find('#menu-button');
				$(button).toggleClass('menu-opened');
				var mainmenu = $(button).next('ul');
				if (mainmenu.hasClass('open')) {
					mainmenu.hide().removeClass('open');
				}
				else {
					mainmenu.show().addClass('open');
					if (settings.format === "dropdown") {
						mainmenu.find('ul').show();
					}
				}
			}

			cssmenu.find('li ul').parent().addClass('has-sub');

			cssmenu.find('li ul li').on('click',function () {
				if ( $(this).parent().attr('id').indexOf('menu-StyleExplorer') == 0) return;
				var options = d3.select(this.parentNode).datum();
				var v = $(this).attr("item_value");
				
				if (options.callback) {
					options.callback.apply(window,[v]);
				}
				
				$(this).parent().find('li').removeClass("selected");
				$(this).addClass("selected");
				$(this).parent().parent().find(".setting").text($(this).text());

				if (cssmenu.find('#menu-button').hasClass('menu-opened') && $( window ).width() <= 700) {
					toggleMenu();
				}
			});

			multiTg = function() {
				cssmenu.find(".has-sub").prepend('<span class="submenu-button"></span>');

				//Looks for selected setting and sets it in parent menu item first time through
				cssmenu.find("ul.options").each(function () {
					var setting = $(this).find("li.selected").text();
					$(this).parent().find("span.setting").text(setting);
				})

				//Handles click on the menu label
				cssmenu.find('.has-sub a').on('click', function() {
					$(this).siblings('span').toggleClass('submenu-opened');
					if ($(this).siblings('ul').hasClass('open')) {
						$(this).siblings('ul').removeClass('open').hide();
					}
					else {
						$(this).siblings('ul').addClass('open').show();
					}
				});

				//Handles click on the menu button
				cssmenu.find('.submenu-button').on('click', function() {
					$(this).toggleClass('submenu-opened');
					if ($(this).siblings('ul').hasClass('open')) {
						$(this).siblings('ul').removeClass('open').hide();
					}
					else {
						$(this).siblings('ul').addClass('open').show();
					}
				});

			};

			if (settings.format === 'multitoggle') multiTg();
			else cssmenu.addClass('dropdown');

			if (settings.sticky === true) cssmenu.css('position', 'fixed');

			resizeFix = function() {

				if ($( window ).width() > 700 ) {
					cssmenu.find('.main-menu').show().addClass("open");
				}
				else {
					cssmenu.find('.main-menu').hide().removeClass("open");
					cssmenu.find('#menu-button').removeClass('menu-opened');
				}

			};
			//resizeFix();
			return $(window).on('resize', resizeFix);

		});
	};
})(jQuery);


function createDemoMenu(options, w, h, title, styles) {
	
	var useInDocs = (window.location.href.indexOf('useInDocs') > -1);
	
	var useInStore = (window.location.href.indexOf('useInStore') > -1);
	
	// Set the size of our container element.
	var menu = d3.select('body').insert('div').attr('id','cssmenu').append('ul').attr('class','main-menu');
	
	d3.select('.container').insert('div','#viz_container')
	 .attr('id','currentStyle')
	 .attr('class','styleCode');
	
	if (useInDocs == true || useInStore == true) {
		d3.select(document.head)
		 .append('link')
		 .attr('rel','stylesheet')
		 .attr('type','text/css')
		 .attr('href','demo/scripts/cssmenu_light.css')
	}
	
	if (styles) {

		var keys = Object.keys(styles).sort();
		
		if (useInDocs == true) {
			
			d3.select('#stylesList').style('margin-left','0px')
			d3.selectAll('.container').style('left','230px')
		
			var styleList = d3.select('body').insert('div', '.container')
			 .attr('id','styleList');
			
			styleList.append('div')
			 .attr('class','styleTitle')
			 .text('STYLE EXPLORER');
			
			styleList.append('div')
			 .attr('class','styleComment')
			 .text('mouse over any style to see it in action')
			
		//	d3.select('#viz_container')
		//	 .style('width',null)
			
			d3.selectAll('.container')
			 .style('position', 'absolute')
			 .style('left', '260px')
			 .style('right', '0px')
			 .style('width',null)
			
			styleList.selectAll('.style').data(keys)
			 .enter()
			 .append('div')
			 .attr('class', 'styleCode')
			 .text(function (d) { return d })
			 .on('mouseover', function (d,i) { setStyle(d) })
			 .on('mouseout', function (d,i) { removeStyle(d) })
		}
		else {
			var styleOption = {};
			styleOption.name = 'Style Explorer'
			styleOption.callback = function () {};
			var values = [];
			values.push({'label': 'Choose a Style', 'value': 'test', 'selected':true})
			values.push({'label': 'Clear Styles', 'value': 'test'})
			keys.forEach(function (key) {
				var value = {'label': key, 'value': styles[key]}
				values.push(value);
			})
			styleOption.values = values;
			demoOptions.splice(0, 0, styleOption)
		}
		
	}
	
	options.forEach(function (option) {
		if (useInDocs == true && option.name == 'Display') {
			//skip
		}
		else {
			var menuItem = menu.append('li').attr('class','active');
			
			var a = menuItem.append('a');
			a.append('span').text(option.name);
			a.append('br');
			a.append('span').attr('class','setting');
			
			var list = menuItem.append('ul').attr('id','menu-' + String(option.name).replace(/ /g,'')).attr('class','options').attr('callback',option.callback.name);
			list.datum(option);
			option.values.forEach(function (value) {
				list.append('li').attr("class",function() { return (value.selected) ? 'selected' : null }).attr('item_value',value.value).append('a').text(value.label);
			})
		}
	})
	
	d3.select('#menu-Display')
	 .insert('li')
	 .attr('item_value', w + ',' + h)
	 .attr('class', 'selected')
	 .append('a').text(w + 'px - ' + h + 'px');
	
	$('#cssmenu').menumaker({
		title: String(title).toUpperCase(),
		format: 'multitoggle'
	});
	
	if (useInDocs == true || useInStore == true) {
		d3.selectAll('#vizuly-logo').remove();
	}
	
	var styleMenu = d3.selectAll('#menu-StyleExplorer');
	
	if (useInDocs == false && styles) {
		//Alter Style Explorer
		d3.select(styleMenu.node().parentNode).style('width', '160px').attr('id','styleMenu');
		
		styleMenu.selectAll('li a')
		 .style('width','200px')
		 .on('click', function (d, i) { setStyle(options[0].values[i].label)  })
		
		styleMenu.selectAll('li')
		 .style('height','25px')
	}

	
	var currentStyle;
	
	function setStyle(d) {
		if (d == "Choose a Style") return;
		
		viz.clearStyles();
		
		//Reset Theme Demo Menu
		var themeMenu = d3.select("#menu-Theme")
		
		themeMenu
		 .selectAll('li')
		 .attr('class',function (d,i) { return (i == 0) ? 'selected' : null })
		
		$(themeMenu.node()).parent().find(".setting").text('Default');
		
		if (d == 'Clear Styles') {
			viz.update();
			d3.select('#currentStyle').text('')
			return;
		}
		
		if (d == currentStyle) {
			removeStyle(d);
			currentStyle = null;
			return;
		}
		
		var value;
		currentStyle = d;
		
		if (Array.isArray(styles[d])) {
			viz.style(d,styles[d]);
		}
		else if (styles[d] === Object(styles[d])) {
			Object.keys(styles[d]).forEach(function (key) {
				if(!value) value = styles[d][key];
				viz.style(key, styles[d][key])
			})
		}
		else {
			viz.style(d, styles[d])
			value = encodeStyleValue(styles[d]);
		}
		viz.duration(0).update().duration(500);
		d3.select('#currentStyle').text("viz.style('" + d + "', " + value + ")")
	}
	
	function removeStyle(d) {
		
		if (Array.isArray(styles[d])) {
			styles[d].forEach(function (d) {
				viz.style(d.name, null)
			})
		}
		else {
			viz.style(d, null)
		}
		
		if (currentStyle) {
			viz.applyStyles(currentStyle);
			
			if (viz.updateStyles) {
				viz.updateStyles();
			}
			else {
				viz.duration(0).update().duration(500);
			}
		}
		
		d3.select('#currentStyle').text('');
	}
	
	function encodeStyleValue(value) {
		if (typeof value == 'string') {
			return "'" + value + "'";
		}
		else if (Array.isArray(value)) {
			return "[" + value.toString() + "]";
		}
		else {
			return value;
		}
	}

}


