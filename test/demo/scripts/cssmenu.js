(function($) {
	
	var styles;
	
	$.fn.menumaker = function(options) {

		var cssmenu = $(this), settings = $.extend({
			title: "Menu",
			format: "dropdown",
			sticky: false
		}, options);

		return this.each(function() {
			cssmenu.prepend('<div id="menu-button"><img src="demo/scripts/vizuly_logo_16x16.png" class="logo">' + settings.title + '</div>');

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
				var f=$(this).parent().attr("callback");
				var v = $(this).attr("item_value");
				if (f) window[f].apply(window,[v]);
				$(this).parent().find('li').removeClass("selected");
				$(this).addClass("selected");
				$(this).parent().parent().find(".setting").text($(this).text());

				if (cssmenu.find('#menu-button').hasClass('menu-opened') && $( window ).width() <= 800) {
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

				if ($( window ).width() > 800 ) {
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
	
	if (styles) {
		this.styles = styles
		var styleOption = {};
		styleOption.name = 'Style Explorer'
		styleOption.callback = function () {};
		var values = [];
		values.push({'label': 'Hover on a style', 'value': 'test', 'selected':true})
		Object.keys(styles).forEach(function (key) {
			var value = {'label': key, 'value': styles[key]}
			values.push(value);
		})
		styleOption.values = values;
		demoOptions.splice(0, 0, styleOption)
	}

	// Set the size of our container element.
	var menu = d3.select('body').insert('div').attr('id','cssmenu').append('ul').attr('class','main-menu');

	options.forEach(function (option) {

		var menuItem = menu.append('li').attr('class','active');

		var a = menuItem.append('a');
		a.append('span').text(option.name);
		a.append('br');
		a.append('span').attr('class','setting');

		var list = menuItem.append('ul').attr('id','menu-' + String(option.name).replace(/ /g,'')).attr('class','options').attr('callback',option.callback.name);

		option.values.forEach(function (value) {
			list.append('li').attr("class",function() { return (value.selected) ? 'selected' : null }).attr('item_value',value.value).append('a').text(value.label);
		})
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
	
	//Alter Style Explorer
	var styleMenu = d3.selectAll('#menu-StyleExplorer');
	
	if (styles) {
		
		d3.select(styleMenu.node().parentNode).style('width', '200px').attr('id','styleMenu')
		styleMenu.selectAll('li a')
		 .style('width','200px')
		 .on('mouseover', function (d,i) { setStyle(options[0].values[i].label) })
		 .on('mouseout', function (d,i) { removeStyle(options[0].values[i].label) })
		
		styleMenu.selectAll('li')
		 .style('height','25px')
		
		if (window.location.href.indexOf('themeLight') > -1) {
			console.log("themed");
			d3.select(document.head)
			 .append('link')
			 .attr('rel','stylesheet')
			 .attr('type','text/css')
			 .attr('href','demo/scripts/cssmenu_light.css')
		}
	}
	
	function setStyle(d) {
		var value;
		
		if (Array.isArray(styles[d])) {
			styles[d].forEach(function (d) {
				viz.style(d.name, d.value)
			})
			value = encodeStyleValue(styles[d][0].value)
		}
		else {
			viz.style(d, styles[d])
			value = encodeStyleValue(styles[d]);
		}
		viz.duration(0).update().duration(500);
		d3.select('#styleCode').text("viz.style('" + d + "', " + value + ")")
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
		viz.applyStyles(currentStyle).duration(0).update().duration(500);
		d3.select('#styleCode').text('');
	}
	
	function encodeStyleValue(value) {
		if (typeof value == 'string') {
			return "'" + value + "'";
		}
		else {
			return value;
		}
	}

}


