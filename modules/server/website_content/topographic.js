var map = {
    width: 1256.64,
    height: 812.82,
    extra: {x: 148.3, y: 328.2},
    extraCanvas: {x: - 481.3, y: - 80.1},
    scale: 1,
    translate: {x: 0, y: 0}
};
var settings = {
    canvasReloadAlways: false, // auto or always
    canvasReloadTimeout: undefined,
    canvasReloadDelay: 200,
    file: '/file/uk_all_data.csv', // default file
    // cursorRadius: 10, // the radius of selection onclick
    // cursorSensitivity: 4, // the distance that is treated as click
    timeFromTimeout: null,
    timeToTimeout: null,

    radius: 1, // marker circle radius
    opacity: 1, // opacity

    selectLimitation: false,
    currentSelectedData: {},

    limitDisplay: null,
    fetchDataLoading: false,

    colors: [],
    colorType: 'single' // single, authors, time
};


// Initilise file name from path
( function() {
    var file_name = location.pathname.split('/');
    file_name = file_name[file_name.length - 1]
    settings.file = '/file/' + file_name;
})();


function resize(){
    var width = document.body.clientWidth - 2;
    var height = document.body.clientHeight - 4;

    if(window.svg !== undefined){
        var centerW = (width - map.width) / 2;
        var centerH = (height - map.height) / 2;

        var x = map.translate.x + (centerW  + map.extra.x) * map.scale;
        var y = map.translate.y + (centerH  + map.extra.y) * map.scale;

        svg.attr('width', width).attr('height', height);
        g.attr('transform', 'translate(' +
            x + ',' +
            y + ')' +
        'scale(' + map.scale + ')');
    }

    if(window.canvas !== undefined){
        canvas.width = width;
        canvas.height = height;

        // reload canvas
        if(mapContent.data !== undefined) {
            if(settings.canvasReloadAlways === false){
                window.clearTimeout(settings.canvasReloadTimeout);
                canvas.clear();
                settings.canvasReloadTimeout =
                    window.setTimeout(addCircles, settings.canvasReloadDelay);
            }
            else {
                addCircles();
            }
        }
    }

    if(window.cursorCanvas !== undefined){
        cursorCanvas.width = width; cursorCanvas.height = height;
    }
}

/* ADDING THE MAP */
var projection = d3.geo.mercator()
    .center([0, 0])
    .scale(200)
    .rotate([-12, 0]);
var svg = d3.select("body").append("svg");
var path = d3.geo.path()
    .projection(projection);
var g = svg.append("g");

d3.json('file/world_no_antarctica.json', function (collection) {
    countryFeature = g.selectAll('path')
        .data(collection.features)
        .enter()
        .append('path')
        .attr('d', path);

    countryFeature.append("svg:title").text(function (d) {
        return d.properties.name;
    }).attr('text-anchor', 'middle');
});

/* ZOOMING */
var zoom = d3.behavior.zoom()
    .on("zoom", function () {
        map.translate.x = d3.event.translate[0];
        map.translate.y = d3.event.translate[1];
        map.scale = d3.event.scale;

        resize();
    });
svg.call(zoom);
