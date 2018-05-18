var selectionMode = false;

/* Button to show controls */
function showControls(){
    var button = document.getElementsByClassName('hide-button')[0];
    var controls = document.getElementById('controls');
    if (controls.style.left !== '-40px'){
        controls.style.left = '-40px';
        button.innerText = '◀';
        button.style.left = '312px';

        if(selectionMode){
            document.getElementById('selectedData').style.left = '-40px';
        }
    } else {
        controls.style.left = '-340px';
        button.innerText = '▶';
        button.style.left = '10px';

        document.getElementById('selectedData').style.left = '-340px';
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

    console.log('here', displayNumber);
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

    if(!time_i){
        timeFromText.innerText = 'INOP';
        timeToText.innerText = 'INOP';
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

    if(time_i === undefined){ changeTime(); return null; }

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
        console.log(currentValue + '\n' + maxValue + '\n' + stepYears);

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
    console.log(timeType);
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
            cursorButton.innerHTML = 'Show Selector ⥈ ';
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

    filterAuthors()
}

/* FILTERING AUTHORS */
function filterAuthors(){
    var filterBots = document.getElementById('filterAuthorsBots').checked;
    var filterUsers = document.getElementById('filterAuthorsUsers').checked;
    var filterAnonymous = document.getElementById('filterAuthorsAnonymous').checked;

    // user, anon, userhidden
    var user_i = mapContent.header['user'];
    var anon_i = mapContent.header['anon'];
    var userhidden_i = mapContent.header['userhidden'];

    if(!(userhidden_i && anon_i && user_i)){
        mapContent.filteredData = mapContent.selectedData;
        setTime();
        return null;
    }

    var result = [];
    for(var i = 0; i < mapContent.selectedData.length; i++){
        var current = mapContent.selectedData[i];

        if(!current[user_i]) {}
        else if(current[user_i].toLowerCase().includes('bot')){
            if(filterBots) result.push(current);
        }
        else if(current[user_i].split('.')
                .every(function(x){ return parseInt(x) })){
            if(filterAnonymous) result.push(current);
        }
        else if(current[user_i]){
            if(filterUsers) result.push(current);
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
    addCircles();
}

/* REFRESH SETTINGS */
function refreshType(){
    var buttons = document.getElementsByName('refreshType');
    if(buttons[0].checked === true)
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