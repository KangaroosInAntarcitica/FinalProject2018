var svgWidth = 1256.64;
var svgHeight = 812.82;
var extraX = 148.3, extraY = 328.2;
var currentScale = 1;
var translateX = 0, translateY = 0;

function resize(){
    var width = document.body.clientWidth - 2;
    var height = document.body.clientHeight - 4;

    if(window.svg !== undefined){
        var centerW = (width - svgWidth) / 2;
        var centerH = (height - svgHeight) / 2;

        var x = translateX + (centerW  + extraX) * currentScale;
        var y = translateY + (centerH  + extraY) * currentScale;

        svg.attr('width', width).attr('height', height);
        g.attr('transform', 'translate(' +
            x + ',' +
            y + ')' +
        'scale(' + currentScale + ')');
    }

    if(window.canvas !== undefined){
        canvas.width = width;
        canvas.height = height;

        if(coordinates !== undefined)
            addCircles();
    }
}

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

// zoom and pan
var zoom = d3.behavior.zoom()
    .on("zoom", function () {
        translateX = d3.event.translate[0];
        translateY = d3.event.translate[1];
        currentScale = d3.event.scale;

        resize();
    });
svg.call(zoom);

function normalize(coordinates){
    // function transforms coordinates to be -180 to 180, -90 to 90
    var long = coordinates[0], lat = coordinates[1];
    var width = 180, height = 180;

    if(Math.abs(long) > width * 2){
        long = (Math.abs(long) % (width * 2)) * (long > 0 ? 1 : -1);
    }
    if(long < 0) long = width * 2 + long;
    if(long > 180) long = long - 180 * 2;

    if(lat > height) lat = lat % height;
    if(lat < -height) lat = - (Math.abs(lat) % height);

    return [long, lat];
}

var coordinates;
function getCoordinates(){
    fetch('/file/uk_all_page_coords_clear.csv')
        .catch(function(error){ throw error; })
        .then(function(data){ return data.text(); })
        .then(processData);
}

function processData(data){
    function getCoords(line) {
                var coords;

                line = line.split('\t');
                if (line.length > 5) {
                    coords = normalize([parseFloat(line[2]),
                                        parseFloat(line[1])]);
                    coords = [coords[0], coords[1], line[5], line[4]];
                }
                else
                    coords = [null, null, null, null];

                return coords;
            }

            data = data.split('\n');
            data = data.slice(1, data.length);
            data = data.map(getCoords);

            coordinates = data;
            console.log('Data received!');
            console.log(coordinates);

            addCircles();
}
getCoordinates();

var canvas = document.body.appendChild(document.createElement('canvas'));
canvas.setAttribute('id', 'mapCanvas');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
canvas.setAttribute('style', 'position: fixed; top: 0; left: 0; pointer-events: none; ');

var context = canvas.getContext('2d');

function addCircle(x, y){
    context.beginPath();
    context.arc(x, y, 1, 0, 2 * Math.PI);
    context.fill();
}

function addCircles(){
    context.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
    context.fillStyle = '#f008';

    var centerW = ((document.body.clientWidth) / 2 - 481.3) * currentScale;
    var centerH = ((document.body.clientHeight) / 2 - 80.1) * currentScale;

    for (var i = 0; i < coordinates.length; i++){
        var coordinate = coordinates[i];
        coordinate = projection(coordinate);

        addCircle(coordinate[0] * currentScale + centerW + translateX,
            coordinate[1] * currentScale + centerH + translateY);
    }
}
resize();


function getCoordinatesJSON(){
    // Function works too slow and should not be used !!!
    // d3.json("file/uk_all_page_coords_clear.json", function (error, data) {
    //     g.selectAll("circle")
    //         .data(data.features)
    //         .enter()
    //         // .append("a")
    //         // .attr("xlink:href", function (d) {
    //         //         return "https://www.google.com/search?q=" + d.city;
    //         //     }
    //         // )
    //         .append("circle")
    //         .attr("cx", function (d) {
    //             if(d){
    //                 var coord = d.geometry.coordinates;
    //                 return projection([coord[0], coord[1]])[0];
    //             }
    //             else return null;
    //         })
    //         .attr("cy", function (d) {
    //             if(d){
    //                 var coord = d.geometry.coordinates;
    //                 return projection([coord[0], coord[1]])[1];
    //             }
    //             else return null;
    //         })
    //         .attr("r", 1)
    //         .style("fill", "#F008");
}

/* REPEAT ----------------------------- */

var map = {
    width: 1256.64,
    height: 812.82,
    extra: {x: 148.3, y: 328.2},
    extraCanvas: {x: - 481.3, y: - 80.1},
    scale: 1,
    translate: {x: 0, y: 0}
};
var settings = {
    canvasReload: 'auto' // auto or always
};
var canvasReloadTimeout;

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

        if(coordinates !== undefined) {
            window.clearTimeout(canvasReloadTimeout);
            canvas.clear();
            canvasReloadTimeout = window.setTimeout(addCircles, 200);
        }
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

/* CANVAS FUNCTIONS */
function normalize(coordinates){
    // function transforms coordinates to be -180 to 180, -90 to 90
    var long = coordinates[0], lat = coordinates[1];
    var width = 180, height = 180;

    if(Math.abs(long) > width * 2){
        long = (Math.abs(long) % (width * 2)) * (long > 0 ? 1 : -1);
    }
    if(long < 0) long = width * 2 + long;
    if(long > 180) long = long - 180 * 2;

    if(lat > height) lat = lat % height;
    if(lat < -height) lat = - (Math.abs(lat) % height);

    return [long, lat];
}

var coordinates;
function getCoordinates(){
    fetch('/file/uk_all_page_coords_clear.csv')
        .catch(function(error){ throw error; })
        .then(function(data){ return data.text(); })
        .then(processData);
}

function processData(data){
    function getCoords(line) {
                var coords;

                line = line.split('\t');
                if (line.length > 5) {
                    coords = normalize([parseFloat(line[2]),
                                        parseFloat(line[1])]);
                    coords = [coords[0], coords[1], line[5], line[4]];
                }
                else
                    coords = [null, null, null, null];

                return coords;
            }

            data = data.split('\n');
            data = data.slice(1, data.length);
            data = data.map(getCoords);

            coordinates = data;
            console.log('Data received!');
            console.log(coordinates);

            addCircles();
}

var canvas = document.body.appendChild(document.createElement('canvas'));
canvas.setAttribute('id', 'mapCanvas');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
canvas.setAttribute('style', 'position: fixed; top: 0; left: 0; pointer-events: none; ');
canvas.clear = function(){ context.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight); };

var context = canvas.getContext('2d');

function addCircle(x, y){
    context.beginPath();
    context.arc(x, y, 1, 0, 2 * Math.PI);
    context.fill();
}

function addCircles(){
    context.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
    context.fillStyle = '#f008';

    var centerW = ((document.body.clientWidth) / 2 - 481.3) * map.scale;
    var centerH = ((document.body.clientHeight) / 2 - 80.1) * map.scale;

    for (var i = 0; i < coordinates.length; i++){
        var coordinate = coordinates[i];
        coordinate = projection(coordinate);

        addCircle(coordinate[0] * map.scale + centerW + map.translate.x,
            coordinate[1] * map.scale + centerH + map.translate.y);
    }
}

getCoordinates();
resize();
