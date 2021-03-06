/* ADDITIONAL HELPING FUNCTIONS */
var mapContent = {
    selectedData: {},
    filteredData: {},
    data: {},
    allData: {},
    header: {}
};

var languages = {
    'uk': 'Ukrainian',
    'en': 'English',
    'ru': 'Russian'
};

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

/* FETCHING FUNCTIONS */
function getCoordinates(){
    var loadingStatus = document.getElementById('loadingStatus');
    loadingStatus.innerText = 'Loading...';

    // if(settings.fetchDataLoading){
    //     loadingStatus.innerText = 'Another file is loading...';
    //     return null;
    // }

    var errorLoading = false;
    var file = settings.file.slice(6, settings.file.length);
    settings.fetchDataLoading = true;

    fetch(settings.file)
        .then(function(response){ if(!response.ok) errorLoading = true; return response; })
        .catch(function(error){ errorLoading = true; })
        .then(function(data){ return data.text(); })
        .then(function(data){
            if(errorLoading){
                loadingStatus.innerText = 'Error occurred!'
            } else {
                loadingStatus.innerText = 'File ' + file + ' loaded!';
                processData(data);
            }

            settings.fetchDataLoading = false;
        });
}

function processLine(data){
    data = data.split('\t');

    if('lat' in mapContent.header && 'long' in mapContent.header){
        var coordinates = [
            parseFloat(data[mapContent.header['long']]),
            parseFloat(data[mapContent.header['lat']])];
        coordinates = normalize(coordinates);
        data[mapContent.header['long']] = coordinates[0];
        data[mapContent.header['lat']] = coordinates[1];

        // skip data without coordinates
        if (!(coordinates[0] && coordinates[1])) return null;
    }
    if('timestamp' in mapContent.header) {
        var time = data[mapContent.header['timestamp']];
        time = new Date(time);
        time = Number(time);
        data[mapContent.header['timestamp']] = time;
    }
    return data;
}

function processData(data){
    data = data.split('\n');

    var header = data[0].split('\t');
    mapContent.header = {};

    // get all header data
    for(var i = 0; i < header.length; i++){
        mapContent.header[header[i]] = i;
    }
    mapContent.header.color = header.length;

    data = data.slice(1, data.length);
    data = data.map(processLine).filter(function(x){ return !!x; });

    mapContent.allData = data;
    mapContent.selectedData = mapContent.allData;

    setUpColors();
    filterAuthors();
}


/* MAP CANVAS FUNCTIONALITY */
var canvas = document.body.appendChild(document.createElement('canvas'));
canvas.setAttribute('id', 'mapCanvas');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
canvas.setAttribute('style', 'position: fixed; top: 0; left: 0; pointer-events: none; ');
canvas.clear = function(){ context.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight); };

var context = canvas.getContext('2d');

function addCircle(x, y){
    context.beginPath();
    context.arc(x, y, settings.radius, 0, 2 * Math.PI);
    context.fill();
}

function addCircles(){
    var loadingStatus = document.getElementById('loadingStatus');

    if(!mapContent.data) return null;
    if(!mapContent.header['lat'] || !mapContent.header['long']) {
        loadingStatus.innerText = 'Error: No coordinates!';
        return null;
    }

    var opacity = opacityToHex(settings.opacity) || 'FF';
    context.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
    context.fillStyle = settings.colors[0] + opacity;

    var centerW = ((document.body.clientWidth) / 2 - 481.3) * map.scale;
    var centerH = ((document.body.clientHeight) / 2 - 80.1) * map.scale;

    var lat_i = mapContent.header['lat'];
    var long_i = mapContent.header['long'];
    var color_i = settings.colorType !== 'single' && mapContent.header.color;
    for (var i = 0; i < mapContent.data.length; i++){
        // hadles limit display functionality
        if(settings.limitDisplay && i >= settings.limitDisplay) break;
        var currentItem = mapContent.data[i];

        // change the color
        if(color_i){ context.fillStyle = currentItem[color_i] + opacity; }

        var coordinate = [currentItem[long_i], currentItem[lat_i]];
        coordinate = projection(coordinate);

        addCircle(coordinate[0] * map.scale + centerW + map.translate.x,
            coordinate[1] * map.scale + centerH + map.translate.y);
    }

    changeLimitDisplay();
}

/* CURSOR CANVAS */
var cursorCanvas = document.body.appendChild(document.createElement('canvas'));
cursorCanvas.context = cursorCanvas.getContext('2d');
cursorCanvas.setAttribute('id', 'cursorCanvas');

cursorCanvas.clear = function(){
    cursorCanvas.context.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
    // cursorCanvas.context.fillStyle = '#0091cc33';
    // cursorCanvas.context.strokeStyle = '#00C9FF';
    cursorCanvas.context.fillStyle = '#37414a33';
    cursorCanvas.context.strokeStyle = '#37414a';
};

cursorCanvas.style.display = 'none';
cursorCanvas.style.top = '0';
cursorCanvas.style.left = '0';
cursorCanvas.style.position = 'fixed';
cursorCanvas.coordinates = {
    mousedown: false,
    mousedragged: false,
    start: {x: undefined, y: undefined},
    end: {x: undefined, y: undefined}
};

function findData(include){
    var result = [];
    if (!mapContent.data){
        addSelectedData(result);
        return null;
    }

    var centerW = ((document.body.clientWidth) / 2 - 481.3) * map.scale;
    var centerH = ((document.body.clientHeight) / 2 - 80.1) * map.scale;
    var startX = cursorCanvas.coordinates.start.x,
        startY = cursorCanvas.coordinates.start.y;
    var x = cursorCanvas.coordinates.end.x,
        y = cursorCanvas.coordinates.end.y;
    var circle = cursorCanvas.coordinates.circle;

    var lat_i = mapContent.header['lat'];
    var long_i = mapContent.header['long'];

    for (var i = 0; i < mapContent.data.length; i++){
        var currentItem = mapContent.data[i];
        var coordinate = [currentItem[long_i], currentItem[lat_i]];
        coordinate = projection(coordinate);
        coordinate[0] = coordinate[0] * map.scale + centerW + map.translate.x;
        coordinate[1] = coordinate[1] * map.scale + centerH + map.translate.y;

        var is_inside = (startX < coordinate[0] && coordinate[0] < x ||
            startX > coordinate[0] && coordinate[0] > x) &&
            (startY < coordinate[1] && coordinate[1] < y ||
            startY > coordinate[1] && coordinate[1] > y);

        if(include == is_inside){
            result.push(mapContent.data[i]);
        }

    }

    return result;
}

cursorCanvas.onmousedown = function(event){
    cursorCanvas.coordinates.start.x = event.clientX;
    cursorCanvas.coordinates.start.y = event.clientY;
    cursorCanvas.coordinates.mousedown = true;
    cursorCanvas.coordinates.mousedragged = false;
};
cursorCanvas.onmousemove = function(event){
    if(!cursorCanvas.coordinates.mousedown) return null;
    cursorCanvas.coordinates.mousedragged = true;

    cursorCanvas.clear();
    cursorCanvas.context.lineWidth = 0.5;

    var x = event.clientX, y = event.clientY;
    var startX = cursorCanvas.coordinates.start.x,
        startY = cursorCanvas.coordinates.start.y;
    var rect = new Path2D();
    rect.rect(startX, startY, x - startX, y - startY);

    cursorCanvas.context.fill(rect);
    cursorCanvas.context.stroke(rect);
};

cursorCanvas.onmouseup = function(event){
    if(!cursorCanvas.coordinates.mousedragged){ cursorCanvas.clear(); }

    cursorCanvas.coordinates.end.x = event.clientX;
    cursorCanvas.coordinates.end.y = event.clientY;

    var selectedData = findData(true);
    addSelectedData(selectedData);

    cursorCanvas.coordinates.mousedown = false;
};

resize();
