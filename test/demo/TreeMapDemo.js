var styles = {
	'background-gradient-top': '#0000FF',
	'background-gradient-bottom': '#0000FF',
	'cell-corner-radius': 0,
	'cell-padding': 15,
	'cell-padding-top': 20,
	'cell-padding-inner': 15,
	'cell-font-size': 20,
	'cell-label-color': '#0000FF',
	'cell-label-opacity': .5,
	'cell-fill': '#0000FF',
	'cell-stroke': '#0000FF',
	'cell-stroke-width': {'cell-stroke-width': 2, 'cell-stroke': '#0000FF'},
	'cell-stroke-opacity': {'cell-stroke-opacity': 1, 'cell-stroke': '#0000FF'},
	'cell-fill-opacity': .25,
	'header-font-size': 12,
	'header-label-color': '#0000FF',
	'group-label-color': '#0000FF'
}

//This changes the size of the component by adjusting the radius and width/height;
function changeSize(val) {
	var s = String(val).split(",");
	d3.select('#viz_container').style('width', s[0] + 'px').style('height', s[1] + 'px');
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
		}
	]

	 createDemoMenu(demoOptions, 600, 600, 'vizuly - TreeMap', styles);

		changeSize(600 + ',' + 600);
}

