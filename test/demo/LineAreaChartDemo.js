// html element that holds the chart
var viz_container;
var businessColors = d3.scaleOrdinal(d3.schemeCategory20);

var fillTopColors = ['#FAFAFA', '#474747', '#1476CD', '#292929', '#571825'];
var fillBottomColors = ['#DDD', '#000000', '#001C4C', '#333', '#220910'];

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

var fillTopColors = ['#474747', '#390E1D', '#29A3E2', '#474747', '#FEFEFE'];

var fillBottomColors = ['#000000','#92203A','#0c54b6','#000000', '#DADADA'];

var labelColors = ['#FFF', '#D8F433', '#FFF', '#FFF']

//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
	viz.width(s[0]).height(s[1]).update();
}

function changeStyles(val) {
	
	if (val === 'business') {
		viz
		 .style('background-gradient-top','#FEFEFE')
		 .style('background-gradient-bottom','#DADADA')
		 .style('area-fill',function (d,i) { console.log(businessColors(i)); return businessColors(i)})
		 .style('line-stroke',function (d,i) { console.log(businessColors(i)); return businessColors(i)})
		 .style('fill-top','#EEE')
		 .style('fill-bottom','#CCC')
		 .style('label-color',"#000")
		 .style('axis-stroke',"#000")
		 .update();
	}
	else {
		viz
		 .style('background-gradient-top',fillTopColors[Number(val)])
		 .style('background-gradient-bottom',fillBottomColors[Number(val)])
		 .style('area-fill', null)
		 .style('line-stroke', null)
		 .style('fill-colors',fillColors[Number(val)])
		 .style('stroke-colors',strokeColors[Number(val)])
		 .style('fill-top',fillTopColors[Number(val)])
		 .style('fill-bottom',fillBottomColors[Number(val)])
		 .style('axis-stroke', "#FFF")
		 .style('label-color', labelColors[Number(val)])
		 .update();
	}
	

}

//This sets the same value for each radial progress
var field="Volume";
function changeField(val) {
	field=val;
	if (val == "Volume") {
		viz.yTickFormat(function (d) { return (Math.round(d/1000000)) + "M";});
	}
	else {
		viz.yTickFormat(function (d) { return "$" + d;});
	}
	viz.y(function (d,i) { return d[val]}).update();
}

function changeLayout(val) {
	viz.layout(val).update();
}

function changeCurve(val) {
	viz.curve(d3[val]).update();
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
				{'label': 'Fire', 'value': '0', 'selected': true},
				{'label': 'Sunset', 'value': '1'},
				{'label': 'Ocean', 'value': '2'},
				{'label': 'Neon', 'value': '3'},
				{'label': 'Business', 'value': 'business'}
			],
			'callback': changeStyles
		},
		{
			'name': 'Layout',
			'values': [
				{'label': 'Overlap', 'value': 'OVERLAP', 'selected' : true},
				{'label': 'Stacked', 'value': 'STACKED'},
				{'label': 'Stream', 'value': 'STREAM'}
			],
			'callback': changeLayout
		},
		{
			'name': 'Curve Type',
			'values': [
				{'label': 'Angular', 'value': 'curveLinear', 'selected' : true},
				{'label': 'Natural', 'value': 'curveNatural'},
				{'label': 'Step', 'value': 'curveStep'}
			],
			'callback': changeCurve
		},
		{
			'name': 'Data Field',
			'values': [
				{'label': 'Volume', 'value': 'Volume', 'selected':true},
				{'label': 'Open', 'value': 'Open'},
				{'label': 'Close', 'value': 'Close'},
				{'label': 'High', 'value': 'High'},
				{'label': 'Low', 'value': 'Low'}
			],
			'callback': changeField
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
		createDemoMenu(demoOptions, screenWidth, screenHeight, 'vizuly - bar chart');
		changeSize(screenWidth + ',' + screenHeight);
		changeStyles(0);
}

