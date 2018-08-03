// html element that holds the chart
var viz_container;

var axiisStyles =
 {
	 'fill-colors': ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A']
 };

var iceStyles =
 {
	 'fill-colors': ['#e8f5fb', '#B9D7E3', '#77c2e9', '#1c99db', '#1882ba', '#115c83', '#0d4563']
 };

var roseStyles =
 {
	 'fill-colors': ['#faeaf1', '#efb6cf', '#e382ad', '#d02f77', '#b12865', '#7d1c47', '#5e1536']
 };

var umberStyles =
 {
	 'fill-colors': ['#feeeec', '#fac2bc', '#f6968c', '#f0503f', '#cc4426', '#903026', '#6c241c']
 };

var evergreenStyles =
 {
	 'fill-colors': ['#f1f9ee', '#cfeac5', '#adda9b', '#77c258', '#65a54b', '#477435', '#365728']
 };


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.update();
}

function changeStyles(val) {
	var styles = this[val];
	
	Object.keys(styles).forEach(function (key) {
		viz.style(key, styles[key])
	})
	
	viz.update();
}


//This sets the same value for each radial progress
function changeData(val) {
	valueField = valueFields[Number(val)];
	viz.update();
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
				{'label': 'Axiis', 'value': 'axiisStyles', selected: true},
				{'label': 'Ice', 'value': 'iceStyles'},
				{'label': 'Rose', 'value': 'roseStyles'},
				{'label': 'Umber', 'value': 'umberStyles'},
				{'label': 'Evergreen', 'value': 'evergreenStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Data',
			'values': [
				{'label': 'Federal', 'value': '0', 'selected': true},
				{'label': 'State', 'value': '1'},
				{'label': 'Local', 'value': '2'}
			],
			'callback': changeData
		},
	]
	
	var screenWidth;
	var screenHeight = 600;
	
	var rect;
	if (self == top) {
		rect = document.body.getBoundingClientRect();
	}
	else {
		rect = parent.document.body.getBoundingClientRect();
	}
	
	//Set display size based on window size.
	screenWidth = (rect.width < 960) ? Math.round(rect.width * .95) : Math.round((rect.width - 210) * .95)
	createDemoMenu(demoOptions, screenWidth, screenWidth, 'vizuly - sunburst');
	
	changeSize(screenWidth + ',' + screenWidth);
	
}

