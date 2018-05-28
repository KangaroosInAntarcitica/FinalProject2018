var selectionMode = false;

/* Button to show controls */
function showControls(){
    var button = document.getElementsByClassName('hide-button')[0];
    var controls = document.getElementById('controls');
    if (controls.style.left !== '-40px'){
        controls.style.left = '-40px';
        button.innerText = '◀';
        button.style.left = '284px';

        if(selectionMode){
            document.getElementById('selectedData').style.left = '-40px';
        }
    } else {
        controls.style.left = '-340px';
        button.innerText = '▶';
        button.style.left = '-16px';

        document.getElementById('selectedData').style.left = '-340px';
    }
}

/* DISABLE A CONTROL */

function enableControls(id, enable){
    // function to disable controls if needed (like when a file is loaded, that
    // lacking some information (timestamp, userid, ...)
    var current_e = document.getElementById(id);

    if(enable){
        current_e.getElementsByClassName('title')[0]
            .classList.remove('disabledTitle');

        for(var i = 0; i < current_e.children.length; i++){
            var child = current_e.children[i];
            if(child.classList.contains('disabled'))
                current_e.removeChild(child);
        }
    } else {
        current_e.getElementsByClassName('title')[0]
            .classList.add('disabledTitle');

        var height = (current_e.clientHeight - 60) + 'px';

        var new_e = document.createElement('div');
        new_e.classList.add('disabled');
        new_e.style.height = height;
        new_e.innerText = 'Disabled';
        current_e.appendChild(new_e);
    }
}


/* CHANGE NUMBER */
function limitDisplay(){
    var input = parseInt(document.getElementById('limitDisplayInput').value);
    var checkbox = document.getElementById('limitDisplayCheckbox').checked;

    if(checkbox && input){
        settings.limitDisplay = input;
    } else {
        settings.limitDisplay = null;
    }

    addCircles();
}

function changeLimitDisplay(){
    var displayNumber = document.getElementById('displayNumber');
    var displayNumberLimited = document.getElementById('displayNumberLimited');
    var input = parseInt(document.getElementById('limitDisplayInput').value);
    var checkbox = document.getElementById('limitDisplayCheckbox').checked;

    var all = mapContent.data.length;
    var limited = all;
    if(checkbox && input && input < all){
        limited = input;
    }

    displayNumber.innerText = 'Found: ' + all;
    displayNumberLimited.innerText = 'Displaying ' + limited + ' coordinates!'
}

/* TIME CONTROLS */
function changeTime(){
    // function selects only current data according to the input
    var timeFromText = document.getElementById('timeFrom'),
        timeToText = document.getElementById('timeTo');
    var timeFromInput = document.getElementById('timeFromInput'),
        timeToInput = document.getElementById('timeToInput');
    var timeFrom = parseInt(timeFromInput.value),
        timeTo = parseInt(timeToInput.value);
    var time_i = mapContent.header['timestamp'];
    var color_i = settings.colorType === 'time' && mapContent.header.color;

    if(!time_i){
        timeFromText.innerText = 'INOP';
        timeToText.innerText = 'INOP';
        addCircles();
        return null;
    }

    // set visual data
    var timeFO = new Date(timeFrom);
    var timeTO = new Date(timeTo);
    timeFromText.innerText = timeFO.getFullYear() + '.' + timeFO.getMonth() + '.' + timeFO.getDate();
    timeToText.innerText = timeTO.getFullYear() + '.' + timeTO.getMonth() + '.' + timeTO.getDate();

    // get needed data
    mapContent.data = [];
    for(var i = 0; i < mapContent.filteredData.length; i++){
        var item = mapContent.filteredData[i];
        var time = item[time_i];
        if(timeFrom <= time && time <= timeTo){
            mapContent.data.push(item);

            item[color_i] = colorRange(settings.colors[0], settings.colors[1],
                (time - timeFrom) / (timeTo - timeFrom)) // percentage
        }
    }

    addCircles();
}

function setTime(){
    // function sets minimal and maximal values and also calls the
    // changeTime() function
    var time_i = mapContent.header['timestamp'];
    var timeFromInput = document.getElementById('timeFromInput'),
        timeToInput = document.getElementById('timeToInput');

    if(time_i === undefined){
        mapContent.data = mapContent.filteredData;
        changeTime();
        enableControls('mapTimeControls', false);
        return null;
    } else { enableControls('mapTimeControls', true); }

    var time_max, time_min;
    for(var i = 0; i < mapContent.filteredData.length; i++){
        var item = mapContent.filteredData[i];
        var time = item[time_i];
        if(time){
            if(!time_max || time > time_max) time_max = time;
            if(!time_min || time < time_min) time_min = time;
        }
    }

    timeFromInput.setAttribute('min', time_min);
    timeFromInput.setAttribute('max', time_max);
    timeFromInput.setAttribute('value', time_min);
    timeToInput.setAttribute('min', time_min);
    timeToInput.setAttribute('max', time_max);
    timeToInput.setAttribute('value', time_max);
    changeTime();
}

function playTimeClick(timeType){
    var timeout = timeType === 'from' ? settings.timeFromTimeout : settings.timeToTimeout;
    if(timeout){
        window.clearTimeout(timeout);
        settings.timeFromTimeout = null; settings.timeToTimeout = null;
        startTime(timeType, false);
    } else {
        playTime(timeType);
    }
}

function playTime(timeType){
    var timeFromInput = document.getElementById('timeFromInput');
    var timeToInput = document.getElementById('timeToInput');
    var input = timeType === 'from' ? timeFromInput : timeToInput;

    var timeout = timeType === 'from' ? settings.timeFromTimeout : settings.timeToTimeout;
    var otherTimeout = timeType === 'from' ? settings.timeToTimeout : settings.timeFromTimeout;

    var stepYears = parseFloat(document.getElementById('stepYears').value);
    stepYears *= 31536000000; // milliseconds in year
    var stepSeconds = parseFloat(document.getElementById('stepSeconds').value);
    stepSeconds *= 1000;

    window.clearTimeout(otherTimeout);
    startTime(timeType === 'from' ? 'to' : 'from', false);
    var currentValue = parseInt(input.value);
    var maxValue = parseInt(input.getAttribute('max'));

    if(currentValue < maxValue){
        if(currentValue + stepYears >= maxValue) currentValue = maxValue;
        else currentValue += stepYears;

        if(timeType === 'from') settings.timeFromTimeout =
            window.setTimeout(playTime.bind(this, timeType), stepSeconds);
        else settings.timeToTimeout =
            window.setTimeout(playTime.bind(this, timeType), stepSeconds);

        input.value = currentValue;
        changeTime();
    } else {
        settings.timeFromTimeout = null; settings.timeToTimeout = null;
    }

    if(timeType === 'from' && settings.timeFromTimeout ||
       timeType === 'to' && settings.timeToTimeout){
        startTime(timeType, true);
    } else {
        startTime(timeType, false);
    }
}

function startTime(timeType, start){
    // function merely changes time play display

    var timeFromButton = document.getElementById('timeFromButton');
    var timeToButton = document.getElementById('timeToButton');
    if(timeType === 'from'){
        start ? (timeFromButton.innerText = '❚❚') : (timeFromButton.innerText = '▶');
    }
    else if(timeType === 'to'){
        start ? (timeToButton.innerText = '❚❚') : (timeToButton.innerText = '▶');
    }
}

/* CURSOR CANVAS */
function showCursorCanvas(){
    // just animations
    var cursorButton = document.getElementById('cursorButton');
    if(cursorCanvas !== undefined){
        if(cursorCanvas.style.display === 'none'){
            cursorButton.style.color = '#FFF';
            cursorButton.style.backgroundColor = '#69e0e4';
            cursorButton.innerHTML = 'Hide Selector ⥈ ';
            cursorCanvas.style.display = 'block';

            selectionMode = true;
            document.getElementById('selectedData').style.left = '-40px';
        }
        else {
            cursorButton.style.color = '#37414a';
            cursorButton.style.backgroundColor = '#FFF';
            cursorButton.innerHTML = 'Show Selector <span style="color: #F00"> ⥈ </span> ';
            cursorCanvas.style.display = 'none';

            selectionMode = false;
            document.getElementById('selectedData').style.left = '-340px';
        }
    }
}

function addSelectedData(data){
    settings.currentSelectedData = data;

    var container = document.getElementById('selectedDataContainer');
    container.innerHTML = '';

    var new_title = document.createElement('div');
    new_title.classList.add('selectedDataNumber');
    new_title.innerText = 'Selected: ' + data.length;
    new_title.style.marginBottom = '16px';
    container.appendChild(new_title);

    for(var i = 0; i < 100 && i < data.length; i++){
        var page = data[i];
        var title = page[mapContent.header['title']] || 'Unknown';
        var newEl = document.createElement('div');
        newEl.classList.add('selectedDataItem');
        newEl.onclick = loadWikiPage.bind(this, title);
        newEl.innerText = title;
        container.appendChild(newEl);
    }
}

function loadWikiPage(name){
    location.assign('https://uk.wikipedia.org/wiki/' + name);
}

/* ADDING AND REMOVING CURSOR CANVAS DATA */
function addSelection(){
    mapContent.selectedData = settings.currentSelectedData;
    settings.selectLimitation = true;

    filterAuthors();
}
function removeSelection(){
    mapContent.selectedData = findData(false);
    settings.selectLimitation = true;

    filterAuthors()
}
function resetSelection(){
    mapContent.selectedData = mapContent.allData;
    settings.selectLimitation = false;

    filterAuthors();
}

/* FILTERING AUTHORS */

function filterAuthors(){
    var filterBots = document.getElementById('filterAuthorsBots').checked;
    var filterUsers = document.getElementById('filterAuthorsUsers').checked;
    var filterAnonymous = document.getElementById('filterAuthorsAnonymous').checked;

    console.log('here');
    // user, anon, userhidden
    var user_i = mapContent.header['user'];
    var anon_i = mapContent.header['anon'];
    var userhidden_i = mapContent.header['userhidden'];
    var color_i = (settings.colorType === 'authors') && mapContent.header.color;

    if(user_i === undefined){
        mapContent.filteredData = mapContent.selectedData;
        enableControls('mapFilterControls', false);
        setTime();
        return null;
    } else {
        enableControls('mapFilterControls', true);
    }

    var result = [];
    for(var i = 0; i < mapContent.selectedData.length; i++){
        var current = mapContent.selectedData[i];

        /* colors are also changed accordingly */
        if(!current[user_i]) {}
        else if(current[user_i].toLowerCase().includes('bot')){
            if(filterBots) result.push(current);
            if(color_i) current[color_i] = settings.colors[0];
        }
        else if(current[user_i].split('.')
                .every(function(x){ return parseInt(x) })){
            if(filterAnonymous) result.push(current);
            if(color_i) current[color_i] = settings.colors[2];
        }
        else if(current[user_i]){
            if(filterUsers) result.push(current);
            if(color_i) current[color_i] = settings.colors[1];
        }
    }

    mapContent.filteredData = result;
    setTime();
}

/* FILE INPUT */
var fileInput = document.getElementById('fileInput');
fileInput.value = settings.file.slice(6, settings.file.length);
function changeFile(){
    settings.file = '/file/' + fileInput.value;
    getCoordinates();
}

// this will set to current file
changeFile();

/* REFRESH SETTINGS */
function refreshType(){
    var buttons = document.getElementsByName('refreshType');
    if(buttons[0].checked)
        settings.canvasReloadAlways = true;
    else
        settings.canvasReloadAlways = false;
}

function changeDelayTime(){
    var delayTimeInput = document.getElementById('delayTimeInput');
    var delayTime = parseFloat(delayTimeInput.value);

    if(delayTime){
        settings.canvasReloadDelay = delayTime * 1000;
    } else {
        delayTimeInput.value = settings.canvasReloadDelay / 1000;
    }
}

/* COLOR CONTROLS */

function displayInput(index, display, text){
    var colorOutputs = document.getElementsByClassName('colorInputDisplay');
    if(display){
        colorOutputs[index].parentElement.style.display = 'flex';
        colorOutputs[index].parentElement.getElementsByTagName('p')[0].innerText = text;
    } else {
        colorOutputs[index].parentElement.style.display = 'none';
    }
}

function setUpColors(){
    var colorType = document.getElementsByName('colorType');
    var colorInputs = document.getElementsByClassName('colorInput');
    var colorOutputs = document.getElementsByClassName('colorInputDisplay');

    var header = mapContent.header;
    var timestamp_i = header.timestamp,
        user_i = header.user,
        anon_i = header.anon,
        userhidden_i = header.userhidden;

    if(timestamp_i === undefined){
        colorType[1].parentElement.style.display = 'none';
        if(colorType[1].checked) colorType[0].checked = true;
    } else {
        colorType[1].parentElement.style.display = 'flex';
    }

    if(user_i === undefined){
        colorType[2].parentElement.style.display = 'none';
        if(colorType[2].checked) colorType[0].checked = true;
    } else {
        colorType[2].parentElement.style.display = 'flex';
    }

    if(colorType[0].checked){
        settings.colorType = 'single';
        displayInput(0, true, 'Primary color:');
        displayInput(1, false); displayInput(2, false);
    }
    if(colorType[1].checked){
        settings.colorType = 'authors';
        displayInput(0, true, 'Bots color:');
        displayInput(1, true, 'Users color:');
        displayInput(2, true, 'Anonym. color:');
    }
    if(colorType[2].checked){
        settings.colorType = 'time';
        displayInput(0, true, 'From color:');
        displayInput(1, true, 'To color:');
        displayInput(2, false);
    }

    settings.colors = [colorInputs[0].value, colorInputs[1].value, colorInputs[2].value];
    for(var i = 0; i < colorOutputs.length; i++){
        colorOutputs[i].style.backgroundColor = settings.colors[i];
    }

    filterAuthors();
}

function colorRange(startColor, endColor, percentage){
    // function calculates a color that is between the 2 colors
    function toNumbers(color){
        return [color.slice(1, 3), color.slice(3, 5), color.slice(5, 7)]
        .map(function(x){ return Number('0x' + x)});
    }
    function toColor(color){
        function hex(num){
            num = num.toString(16);
            if(num.length === 1) num = '0' + num;
            return num;
        }
        return '#' + hex(color[0]) + hex(color[1]) + hex(color[2]);
    }
    function range(start, end, percentage){
        return Math.round(start + (end - start) * percentage);
    }

    startColor = toNumbers(startColor);
    endColor = toNumbers(endColor);
    var result = [];
    for(var i = 0; i < 3; i++){
        result[i] = range(startColor[i], endColor[i], percentage)
    }
    result = toColor(result);

    return result;
}

/* MARKER SETTINGS */

function changeMarkerRadius(){
    var radiusInput = document.getElementById('markerRadius');
    var radius = parseFloat(radiusInput.value);

    if(!radius){
        radiusInput.value = settings.radius;
    } else {
        settings.radius = radius;
        addCircles();
    }

}

function changeMarkerOpacity() {
    var opacityInput = document.getElementById('markerOpacity');
    var opacity = parseFloat(opacityInput.value);

    if(opacity && opacity > 0 && opacity < 1){
        settings.opacity = opacity;
        addCircles();
    } else {
        opacityInput.value = settings.opacity;
    }
}

function opacityToHex(opacity){
    opacity = Math.round(opacity * 255).toString(16);
    if(opacity.length === 1) opacity = '0' + opacity;
    return opacity;
}
