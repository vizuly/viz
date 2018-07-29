// html element that holds the chart
var viz_container;


//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.width(s[0]).height(s[1]).update();
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
		createDemoMenu(demoOptions, screenWidth, screenHeight, 'vizuly - Venn');

		changeSize(screenWidth + ',' + screenHeight);
}

