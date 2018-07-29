// html element that holds the chart
var viz_container;

var businessColors = d3.scaleOrdinal(d3.schemeCategory20);

var fillColors = [
	['#C50A0A', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'],
	['#89208F', '#C02690', '#D93256', '#DB3D0C', '#B2180E'],
	['#FFF', '#FFF', '#FFF', '#FFF', '#FFF'],
	['#D1F704', '#D1F704', '#D1F704', '#D1F704', '#D1F704']
];

var strokeColors = [
	['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B'],
	['#CD57A4', '#B236A3', '#FA6F7F', '#FA7C3B', '#E96B6B'],
	['#0b4ca1', '#0b4ca1', '#0b4ca1', '#0b4ca1', '#0b4ca1'],
	['#FFF', '#FFF', '#FFF', '#FFF', '#FFF']
];

var fillTopColors = ['#474747', '#390E1D', '#29A3E2', '#474747'];

var fillBottomColors = ['#000000','#92203A','#0c54b6','#000000'];

var labelColors = ['#FFF', '#D8F433', '#FFF', '#FFF']

//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.width(s[0]).height(s[1]).update();
}

function changeStyles(val) {
	
	if (val === 'business') {
		viz.style('node-fill',function (d,i) { return businessColors(i)})
		 .style('node-stroke',function (d,i) { return businessColors(i)})
		 .style('node-fill-opacity',1)
		 .style('fill-top','#EFEFEF')
		 .style('fill-bottom','#DDD')
		 .style('label-color',"#000")
		 .style('axis-stroke',"#000")
		 .update();
	}
	else {
		viz
		 .style('node-fill',function (d,i) { return fillColors[Number(val)][i % 5]; })
		 .style('node-stroke',function (d,i) { return fillColors[Number(val)][i % 5]; })
		 .style('fill-top',fillTopColors[Number(val)])
		 .style('fill-bottom',fillBottomColors[Number(val)])
		 .style('node-fill-opacity',null)
		 .style('axis-stroke', "#FFF")
		 .style('label-color', labelColors[Number(val)])
		 .update();
	}
	
}

function changeRadius(val) {
	var scale = (val == 'linear') ? d3.scaleLinear() : d3.scalePow().exponent(.3);
	viz.rScale(scale).update();
}


function changeY(val) {
	var scale = (val == 'linear') ? d3.scaleLinear() : d3.scalePow().exponent(.5);
	viz.yScale(scale).update();
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
				{'label': 'Fire', 'value': '0'},
				{'label': 'Sunset', 'value': '1'},
				{'label': 'Ocean', 'value': '2', 'selected': true},
				{'label': 'Neon', 'value': '3'},
				{'label': 'Business', 'value': 'business'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Radius Scale',
			'values': [
				{'label': 'Linear', 'value': 'linear'},
				{'label': 'Log', 'value': 'log', 'selected' : true}
			],
			'callback': changeRadius
		},
		{
			'name': 'Y Scale',
			'values': [
				{'label': 'Linear', 'value': 'linear'},
				{'label': 'Log', 'value': 'log', 'selected' : true}
			],
			'callback': changeY
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
		createDemoMenu(demoOptions, screenWidth, screenHeight, 'vizuly - scatter plot');

		changeSize(screenWidth + ',' + screenHeight);
		changeStyles(1)
}

