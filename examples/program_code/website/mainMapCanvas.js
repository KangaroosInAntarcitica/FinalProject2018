var extra = 100;
var width = document.body.clientWidth - 10;
var height = document.body.clientHeight - 10;
var square = width > height ? height : width;

var countryFeature;
var datacentreFeature;


// TODO fix d3.geo.azimuthal to be consistent with scale
var scale = {
    orthographic: 380, stereographic: 380, gnomonic: 380,
    equidistant: 380 / Math.PI * 2, equalarea: 380 / Math.SQRT2
};
var currentScale = 300;
var defaultScale = 300;

var projection = d3.geo.azimuthal()
    .scale(currentScale)
    .origin([0, 0])
    .mode('orthographic')
    // .clipAngle(90)
    .translate([width / 2, height / 2]);

var circle = d3.geo.greatCircle().origin(projection.origin());

var path = d3.geo.path().projection(projection);
var svg = d3.select("#chart").append('svg:svg')
    .attr('width', width)
    .attr('height', height)
    .on('mousedown', mousedown);
var countries = svg.append('g')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'countries');
var dataCentres = svg.append('g')
    .attr('width', width)
    .attr('height', height)
    .attr('id', 'dataCentres');


d3.json('file/world.json', function (collection) {
    countryFeature = countries.selectAll('path')
        .data(collection.features)
        .enter().append('svg:path')
        .attr('d', clip);

    countryFeature.append("svg:title").text(function (d) {
        return d.properties.name;
    }).attr('text-anchor', 'middle');
});


d3.select(window).on('mousemove', mousemove).on('mouseup', mouseup);
var m0, o0;

function mousedown() {
    m0 = [d3.event.pageX, d3.event.pageY];
    o0 = projection.origin();
    d3.event.preventDefault();
}

function mousemove() {
    if (m0) {
        var m1 = [d3.event.pageX, d3.event.pageY];

        var o1 = [o0[0] + (m0[0] - m1[0]) * (300 / currentScale / 8),
            o0[1] + (m1[1] - m0[1]) * (300 / currentScale / 8)];

        projection.origin(o1);
        circle.origin(o1);
        refresh();
    }


    window.smallMap ? window.smallMap.mousemove() : null;
}

function mouseup() {
    if (m0) {
        mousemove();
        m0 = null;
    }

    window.smallMap ? window.smallMap.mouseup() : null;

    // refresh canvas
    addCircles();
}

function refresh(duration) {
    (duration ?
        countryFeature.transition().duration(duration)
        : countryFeature)
        .attr('d', clip);
}


function clip(d) {
    return path(circle.clip(d));
}

function scaleMap(where){
    if(where === '+') {
        currentScale *= 1.5;
    }
    else if (where === '-')
        currentScale /= 1.5;

    projection.scale(currentScale);
    refresh();
    addCircles();
}


function normalize(coordinates){
    var long = coordinates[0], lat = coordinates[1];
    var width = Math.PI, height = Math.PI;

    if(Math.abs(long) > width * 2){
        long = (Math.abs(long) % (width * 2)) * (long > 0 ? 1 : -1);
    }
    if(long < 0) long = width * 2 + long;
    if(long > Math.PI) long = long - Math.PI * 2;

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
                    coords = normalize([parseFloat(line[2]) / 180 * Math.PI,
                                        parseFloat(line[1]) / 180 * Math.PI]);
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

var canvas = document.getElementById('mapCanvas');
canvas.setAttribute('id', 'mapCanvas');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
canvas.setAttribute('style', 'position: fixed; top: 0; left: 0;');
d3.select('#mapCanvas').on('mousedown', mousedown);

var context = canvas.getContext('2d');
context.fillStyle = '#F008';

function addCircle(x, y){
    context.beginPath();
    context.arc(x, y, 2, 0, 2 * Math.PI);
    context.fill();
}

function addCircles(){
    context.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);

    var scale = currentScale / defaultScale;
    var width = 599.4 * scale;
    var height = 598.12 * scale;
    console.log(width);

    var centerW = document.body.clientWidth / 2,
        centerH = document.body.clientHeight / 2;

    var origin = [projection.origin()[0] / 180 * Math.PI,
            projection.origin()[1] / 180 * Math.PI];
    origin = normalize(origin);

    for (var i = 0; i < coordinates.length; i++){
        var coordinate = coordinates[i];

        var long = coordinate[0] - origin[0];
        var lat = coordinate[1] - origin[1];

        if(long > Math.PI / 2 || long < - Math.PI / 2 ||
           lat > Math.PI / 2 || lat < - Math.PI / 2){
            continue;
        }

        var angle = Math.atan(lat / long);
        if(long < 0) { angle = angle + 180; }
        var maxLength = Math.abs(1 / Math.sin(angle));
        if(Math.abs(1 / Math.cos(angle)) < maxLength) {
            maxLength = Math.abs(1 / Math.cos(angle));
        }
        maxLength *= Math.sqrt(2);
        var k = 1 / maxLength;
        // k = Math.sqrt(k)

        var x = (long * Math.cos(lat)) / Math.PI * width + centerW;
        var y = - (lat * Math.cos(long)) / Math.PI * height + centerH;
        // console.log(long, lat, x, y);

        var x = long * k / Math.PI * width + centerW;
        var y = - lat * k / Math.PI * height + centerH;

        // var x = Math.sin(long) * Math.cos(lat) * width / 2 + centerW; //
        // var y = - Math.sin(lat) * height / 2 + centerH;

        addCircle(x, y);
    }
}


