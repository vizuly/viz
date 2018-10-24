var styles = {
	'background-color-top': '#0000FF',
	'background-color-bottom': '#0000FF',
	'label-color': '#0000FF',
	'font-family': 'Courier'
}

var defaultStyles = {};

var iceStyles = {
	'background-color-bottom': '#B9D7E3',
	'label-color': function (d, i) {
		var colors = ['#77c2e9', '#1c99db', '#1882ba', '#115c83', '#0d4563']
	  return colors[ i % colors.length];
	}
}

var roseStyles = {
	'background-color-bottom': '#faeaf1',
	'label-color': function (d, i) {
		var colors = ['#efb6cf', '#e382ad', '#d02f77', '#b12865', '#7d1c47', '#5e1536']
		return colors[ i % colors.length];
	}
}


var umberStyles = {
	'background-color-bottom': '#feeeec',
	'label-color': function (d, i) {
		var colors = [ '#fac2bc', '#f6968c', '#f0503f', '#cc4426', '#903026', '#6c241c']
		return colors[ i % colors.length];
	}
}


var evergreenStyles = {
	'background-color-bottom': '#f1f9ee',
	'label-color': function (d, i) {
		var colors = ['#cfeac5', '#adda9b', '#77c258', '#65a54b', '#477435', '#365728']
		return colors[ i % colors.length];
	}
}

function changeStyles(val) {
	var styles = this[val];
	viz.clearStyles();
	viz.applyStyles(styles);
	viz.update();
}


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz
	 .fontSizeMax(Math.max(30,s[1] * .1))
	 .update();
}


function runDemo() {

	demoOptions = [
		{
			'name': 'Display',
			'values': [
				{'label': '1000px - 1000px', 'value': '1000,1000'},
				{'label': '800px - 800px', 'value': '800,800'},
				{'label': '375px - 667px', 'value': '375,667'},
				{'label': '320px - 568px', 'value': '320,568'}
			],
			'callback': changeSize
		},
		{
			'name': 'Theme',
			'values': [
				{'label': 'Default', 'value': 'defaultStyles', selected: true},
				{'label': 'Ice', 'value': 'iceStyles'},
				{'label': 'Rose', 'value': 'roseStyles'},
				{'label': 'Umber', 'value': 'umberStyles'},
				{'label': 'Evergreen', 'value': 'evergreenStyles'}
			],
			'callback': changeStyles
		}
	]

	
		createDemoMenu(demoOptions, 600, 600, 'vizuly - WordCloud', styles);

		changeSize('600,600');
}

