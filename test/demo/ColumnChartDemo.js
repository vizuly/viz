// html element that holds the chart
var viz_container;

var blueStyles =
 {
	 'background-gradient-top': '#021F51',
	 'background-gradient-bottom': '#039FDB',
	 'label-color': '#FFF',
	 'bar-fill': '#02C3FF',
	 'axis-stroke': '#FFF',
	 'bar-radius': 0
 }

var pinkStyles =
 {
	 'background-gradient-top': '#540936',
	 'background-gradient-bottom': '#C12780',
	 'label-color': '#FFF',
	 'bar-fill': '#FF35BE',
	 'axis-stroke': '#FFF',
	 'bar-radius': 0
 }

var neonStyles =
 {
	 'background-gradient-top': '#000000',
	 'background-gradient-bottom': '#474747',
	 'label-color': '#FFF',
	 'bar-fill': '#D1F704',
	 'axis-stroke': '#FFF',
	 'bar-radius': function (d, i, groupIndex, e) { return Number(d3.select(e).attr("width"))/2; }
 }

var axiisStyles =
 {
	 'background-gradient-top': '#ECECEC',
	 'background-gradient-bottom': '#D0D0D0',
	 'label-color': '#444',
	 'bar-fill': function (d, i, groupIndex) {
		 var axisColors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
		 return axisColors[groupIndex % axisColors.length]
	 },
	 'axis-stroke': '#777',
	 'bar-radius': 0
 }


var minimalStyles =
 {
	 'background-gradient-top': '#F0F0F0',
	 'background-gradient-bottom': '#F0F0F0',
	 'label-color': '#444',
	 'bar-fill': '#555',
	 'axis-stroke': '#777',
	 'bar-radius': 0
 }


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.width(s[0]).height(s[1]).update();
}

function changeStyles(val) {
	var styles = this[val];
	viz.applyStyles(styles);
	viz.update();
}


function changeSeries(val) {
	 viz
	  .data(data.slice(0,Number(val)))
	  .update();
}


function changeLayout(val) {
	viz.layout(val).update();
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
				{'label': 'Blue', 'value': 'blueStyles', 'selected': true},
				{'label': 'Pink', 'value': 'pinkStyles'},
				{'label': 'Neon', 'value': 'neonStyles'},
				{'label': 'Axiis', 'value': 'axiisStyles'},
				{'label': 'Minimal', 'value': 'minimalStyles'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Series',
			'values': [
				{'label': '3 Medals', 'value': '3', 'selected' : true},
				{'label': '2 Medals', 'value': '2'},
				{'label': '1 Medal', 'value': '1'},
			],
			'callback': changeSeries
		},
		{
			'name': 'Layout',
			'values': [
				{'label': 'Clustered', 'value': 'CLUSTERED', 'selected' : true},
				{'label': 'Stacked', 'value': 'STACKED'}
			],
			'callback': changeLayout
		}
	]

		var screenWidth;
		var screenHeight = 600;

		var rect;
		if (self==top) {
			rect = document.body.getBoundingClientRect();
		}
		else {
			rect =  parent.document.body.getBoundingClientRect();
		}

		//Set display size based on window size.
		screenWidth = (rect.width < 960) ? Math.round(rect.width*.95) : Math.round((rect.width - 210) *.95)
		createDemoMenu(demoOptions, screenWidth, screenHeight, 'vizuly - column chart');

		changeSize(screenWidth + ',' + screenHeight);
}

