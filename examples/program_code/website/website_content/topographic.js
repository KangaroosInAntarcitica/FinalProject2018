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
    file: '/file/uk_all_page_coords_clear.csv', // default file
    cursorRadius: 40,
    cursorSensitivity: 4
};

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
        if(coordinates !== undefined) {
            if(settings.canvasReloadAlways === false){
                window.clearTimeout(settings.canvasReloadTimeout);
                canvas.clear();
                settings.canvasReloadTimeout = window.setTimeout(addCircles, 200);
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
    fetch(settings.file)
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
    if(!coordinates) return null;

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

/* Cursor canvas */
var cursorCanvas = document.body.appendChild(document.createElement('canvas'));
cursorCanvas.context = cursorCanvas.getContext('2d');
cursorCanvas.setAttribute('id', 'cursorCanvas');

cursorCanvas.clear = function(){
    cursorCanvas.context.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
    cursorCanvas.context.fillStyle = '#0091cc22';
    cursorCanvas.context.strokeStyle = '#00C9FF';
};

cursorCanvas.style.display = 'none';
cursorCanvas.style.top = '0';
cursorCanvas.style.left = '0';
cursorCanvas.style.position = 'fixed';
cursorCanvas.dragCoordinates = {x: undefined, y: undefined};

function findData(x, y, circle){
    var result = [];
    if (!coordinates){
        addSelectedData(result);
        return null;
    }

    var centerW = ((document.body.clientWidth) / 2 - 481.3) * map.scale;
    var centerH = ((document.body.clientHeight) / 2 - 80.1) * map.scale;
    var startX = cursorCanvas.dragCoordinates.x,
        startY = cursorCanvas.dragCoordinates.y;

    for (var i = 0; i < coordinates.length; i++){
        var coordinate = projection(coordinates[i]);
        coordinate[0] = coordinate[0] * map.scale + centerW + map.translate.x;
        coordinate[1] = coordinate[1] * map.scale + centerH + map.translate.y;

        if(circle){
            var radius = (Math.sqrt((x - coordinate[0]) ** 2 + (y - coordinate[1]) ** 2));
            if(radius < settings.cursorRadius){
                result.push(coordinates[i]);
            }
        }
        else {
            if((startX < coordinate[0] && coordinate[0] < x ||
                startX > coordinate[0] && coordinate[0] > x) &&
                (startY < coordinate[1] && coordinate[1] < y ||
                startY > coordinate[1] && coordinate[1] > y)){
                result.push(coordinates[i])
            }
        }
    }

    addSelectedData(result);
}

cursorCanvas.onmousedown = function(event){
    cursorCanvas.dragCoordinates.x = event.clientX;
    cursorCanvas.dragCoordinates.y = event.clientY;
};
cursorCanvas.onmousemove = function(event){
    if(cursorCanvas.dragCoordinates.x === undefined) return true;

    cursorCanvas.clear();
    cursorCanvas.context.lineWidth = 0.5;

    var x = event.clientX, y = event.clientY;
    var startX = cursorCanvas.dragCoordinates.x,
        startY = cursorCanvas.dragCoordinates.y;
    var rect = new Path2D();
    rect.rect(startX, startY, x - startX, y - startY);

    cursorCanvas.context.fill(rect);
    cursorCanvas.context.stroke(rect);
};
cursorCanvas.onmouseup = function(event){
    var x = event.clientX, y = event.clientY;
    var startX = cursorCanvas.dragCoordinates.x,
        startY = cursorCanvas.dragCoordinates.y;

    if(Math.abs(x - startX) < settings.cursorSensitivity &&
        Math.abs(y - startY) < settings.cursorSensitivity){
        console.log('here');
        findData(x, y, true);

        var radius = settings.cursorRadius;
        cursorCanvas.clear();
        cursorCanvas.context.beginPath();
        cursorCanvas.context.arc(x, y, radius / 2, 0, Math.PI * 2);
        cursorCanvas.context.fill();
        cursorCanvas.context.stroke();
    } else {
        findData(x, y, false);
    }

    cursorCanvas.dragCoordinates.x = undefined;
    cursorCanvas.dragCoordinates.y = undefined;
};

getCoordinates();
resize();

var languages = {
    'uk': 'Ukrainian',
    'en': 'English',
    'ru': 'Russian'
};
