# Vizuly 2.0 Beta

## Getting Started

1. Clone or copy this repo to your local machine.
2. Open up the 'examples' directory.
3. Launch any of the examples within such as BarChartTest.html in the browser of your choice (Chrome is best.)
4. Use the testing/demo tool at the top of the window to test various styles and settings dynamically.

## Vizuly Component Lifecycle
All data visualization components follow the Vizuly component lifecycle and utlize the base class functions.  Vizuly is 
a lightweight framework and set of design patterns that make it easer to build and modify reusable data visualization 
components to support function chaining propertys, styles, and events.  Vizuly was designed in a way to keep all primary 
lifecycle functions very specific in scope and easy to understand wihth a minimal amount of code.  The primary design 
patterns are the result of thousands of hours of building and modifying data visualization components.  The advantage is 
that after using the design pattern for one component it is relatively trivial for a developer to modify another component,
as all relevant functional code can be found in the same places.  

**Reuse**: 
These components are designed to be flexible and mutable.  By adjusting properties, styles, and using the exposed lifecycle events
to override component settings you can do quite a bit of customization without having to modify the internals of the component.
The advantage of this, is that any implementation specific conditional logic for rendering can be set EXTERNAL to the component 
and avoid creating internal code that becomes brittle and hard to maintain.


**Instantiation --> Measure --> Update --> Destroy**

1.  ***Instantiation***:  
    *Primary purpose*: Create base class properties and set up DOM scaffold elements for subsequent component use.
    
    When creating a new viz component you must pass in the parent DOM element you 
    want to attach the component to.  This only happens once.  
    
    `var myViz = ttd.myViz(document.getElementById('#myViz'));`
    
    Internally the component does a few of things.   First it will create public accessors for all the 
    intnerally declared properties and styles. Secondly it will create base events and any custom events that it may 
    dispatch later.  And finally it creates all of the static DOM elements (primarily SVG) it needs for dynamic rendering later.
    
    All accessors can be set in a function chain syntax like the following:
    
    `myViz.firstProperty(value).secondProperty(value)`
    
    To get a current value from a property call the accessor with no parameter like this:
    
    `myViz.firstProperty()`
    
    All events can be accessed as follows.  You can either reference another function for callback or put 
    one inline.
    
    `myViz.on('myEvent', myCallBackFunction)`
    
    **NOTE** - As a best practice you should not modify this interface with additional variables.  If you 
    find the need to add variables to this interface consider adding additional properties/styles to the component
    that you can set externally.  This will keep the component more flexible for re-use and less brittle by avoding 
    internal conditionals.
    
    
    
2.  ***Measure***:  
    *Primary purpose* - Calculate layout and measurement variables, prep data for rendering, set scales, ranges
    and other like variables.

    For each update cycle of the component a measure function is called.   This function will 
    perform any needed calculations for subsequent display layout, axis formatting, data prep etc.   This 
    function the first thing the update function calls and it primarily manages internal variables used 
    for subsequent rendering in its update call or style setting.
    
    **TIP** - If you want to externally modify a component variable RIGHT before it renders you can 
    intercept the on measure call.  For instance, sometimes in charts we need to customize the number of 
    axis ticks that appear so you may do something like this:
    
    `myViz.on('measure',function () { myViz.yAxis().ticks(10) })`
    
    This will then override the number of axis ticks and set it to 10.   This gives you the flexibility 
    to customize the component display without having to alter the internals of the component.
    

3.  ***Update***:  
    *Primary purpose* - To render all visual elements of the component using the measurement variables previously 
    calculated.
    
    The update function is called each time you want the component to render itself to the 
    screen.   Usually a developer will modify one or more component properties or styles and call update to 
    render the change.  The update function is responsible for creating, removing, and modifying the position 
    and associated measurements of the various DOM elements it manages for the display (primarily SVG geometries.)
    The update function will also attach any custom events to associated rendered DOM elements.  Once the update 
    function is done rendering and modify its geometries the applyStyles function is called.
    
    Generally the update function does NOT set component styles, colors, etc. this is done in the applyStyles function.
    
    Unlike React, these components have no data binding and the developer is responsible for 
    deciding when to apply all property and style changes.  For example:
    
    `myViz.data(newData).firstProperty(newValue).style('myStyle','#FFF').update()`
    
    
5.  ***Styles***:  
    *Primary purpose* -  To modify the visual styles of previously rendered DOM elements (usually SVG geometries) such 
    as color, opacity, strokes, fills, etc.
    
    As of Vizuly 2.0 Styles are first class citizens.  These styles are declared internally 
    by the component developer and get created at instantiation.  Styles can perform simple and complex visual tasks 
    as they are dynamic functors that can be either static parameters or dynamic functions.   For instance, lets say we 
    have a style called 'bar-fill' which sets the fill color for the bars of a bar chart.   We could do the following
    things with this style.
    
    `myViz.style('bar-fill', '#F00')`  
    This static value would set every bar to the color red (#F00)
    
    Or we could do something like this:
    
    `myViz.style('bar-fill', function (d,i) { return myColors[myColors.length % i];})`  
    This dynamic style will use the current bar index (i) to set the fill color to one value from the array of myColors 
    using a modulo operation.
    
    Another example could be like this:
    
    `myViz.style('bar-fill', functin (d,i) { return (d.myValue > myThreshold) ? '#F00' : '#FF0')}`
    This dynamic style will set the bar color to red for any value over `myThreshold` and green for any value less than 
    `myThreshold`.
    
    As you can see these dynamic styles can provide fleixble and powerful ways to modify the visual appearance of the 
    component based on a myriad of different factors. 
    
    
4.  ***Destroy***:  
    *Primary purpose* - To to detach a component from the DOM and free up any memory/event bindings.

    When you no longer have any use for the component in your application you can call the destroy function as seen below.
    
    `myViz.destroy()`
    
    If you simply want to hide the component from view while still keeping internal state you can do a few things.  You 
    may either manually remove it from the DOM tree, but keep the variable, or you can simply set the viz 'selection' 
    display style to 'none' to hide it from view.
    
    `myViz.selection().style('display','none')`
    
    
5.  ***Exposed Events***:
    Each component exposes a set of default and custom events that can be captured using the 'on' syntax like this:
    
    `myViz.on('eventname', myCallBackFunction)`
    
    *`initalized`* - Called at end of component instantiation after all public accessors, styles, events, and DOM scaffold 
    elements have been created. 
    
    *`measured`* - Called at end of measure function (which is called for each update.)  This is a good place to override 
    properties you may need to immediately prior to rendering.
    
    *`updated`* - Called at end of update (render) function prior to any styles being applied.
    
    *`styled`* - Called at end of styles being applied to rendered DOM elements.
    
    *`property_change`* -  All public accessors will emit a change event when their values are changed.  The synax is
    `propertyname_change`.   For instance the following would be called each time the data property has changed.
    
    `viz.on('data_change',myDataChangeCallbackFunction)`
    
    Additional custom events can also be emitted.  For instance many components will emit a `mouseover`, 
    `mouseout`, and `click` events for specific on screen elements and pass in their relative parameters to the callback 
    function.   All callback functions implement similar interfaces, with the first three parameters being an `e`, `d` 
    and `i`.  Some events will pass along additional parameters.
    
    `function myCallBackFunction (e, d, i) { ... }`
    
    `e` - The target DOM element
    `d` - The associated datum
    `i` - The associated index value
    `this` - The component emitting the event
    
    For each event callback the scope variable `this` will always be the component emitting the event.
    
    
    
    
