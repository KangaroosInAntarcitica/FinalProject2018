var mainContainer = createFileContainer([], 'add');
var processingContainer = createFileContainer([], 'remove');
mainContainer.clickFunction = function(fileElement, file) {
    processingContainer.add(fileElement, file);
    processControls();
};
processingContainer.clickFunction = function(fileElement, file) {
    processingContainer.remove(fileElement, file);
    processControls();
};

document.getElementById('mainContainer').appendChild(mainContainer);
document.getElementById('processingContainer').appendChild(processingContainer);


function loadFiles(){
    fetch('/files')
        .then(function(data){ return data.text(); })
        .then(function(data){
            data = JSON.parse(data).files;
            mainContainer.update(data);
        });
}

loadFiles();

/* THE PROCESSING PART */

var FILE_NAMES = {
    pages: '_all_pages.csv',
    coordinates: '_coordinates.csv',
    revisions: '_revisions.csv'
};


var actionError = false;
function setError(type, message){
    var TYPES = {
        'change': 'changeError',
        'merge': 'mergeError',
        'action': 'actionError'
    };

    var error = document.getElementById(TYPES[type]);
    error.innerText = message;
    error.style.display = 'block';
}

function clearErrors(){
    // function clears all errors
    var errors = document.getElementsByClassName('error');
    for(var item of errors){
        item.style.display = 'none';
    }
}

function processControls(){
    clearErrors();
    actionError = false;

    var languageInput = document.getElementById('languageInput');
    var actionInputs = document.getElementsByName('actionInput');
    var changeFromInput = document.getElementById('changeFromInput');
    var fromInput = document.getElementById('fromInput');
    var toInput = document.getElementById('toInput');

    var language = languageInput.value.toLowerCase();
    var files = processingContainer.files;

    // Change the from file
    if(files.length > 0){
        changeFromInput.value = files[0].name;
    } else {
        changeFromInput.value = 'None';
    }

    // Language options
    if(files.length > 0){
        languageInput.value = files[0].name.slice(0, 2);
    } else {
        if(!(language.length > 1 && language.length < 4)){
            actionError = 'Language should be a code of length 2';
        }
        if(!language.split('').every((char) => 'abcdefghijklmnopqrstuvwxyz'.split('').some(x => x === char))){
            actionError = 'Only letters allowed in the language code!';
        }
    }
    changeAction();
}
processControls();

function changeAction(){
    var fromInput = document.getElementById('fromInput');
    var toInput = document.getElementById('toInput');
    var actionInputs = document.getElementsByName('actionInput');
    var language = document.getElementById('languageInput').value.toLowerCase();

    var files = processingContainer.files;

    var toFile;
    if(actionInputs[0].checked) {
        fromInput.value = 'None';
        toFile = FILE_NAMES.pages;
    }
    else if(actionInputs[1].checked){
        fromInput.value = files[0] ? files[0].name : 'None';
        toFile = FILE_NAMES.coordinates
    }
    else if(actionInputs[2].checked){
        fromInput.value = files[0] ? files[0].name : 'None';
        toFile = FILE_NAMES.revisions
    }

    if(!actionInputs[0].checked && files.length < 1){
        actionError = 'No file selected!';
        setError('action', 'No file selected!');
    }

    toFile = language + toFile;
    toInput.value = toFile;
}

/* Sending commands */
function sendCommand(command){
    command = '/function/' + command;

    fetch(command)
        .then(data => data.text())
        .then(loadFiles);
}

function clearCoordinatesRequest(){
    // CHANGE SINGLE FILE
    clearErrors();
    var files = processingContainer.files;

    if(files.length < 1){
        setError('change', 'No file selected!'); return null;
    }

    if(files[0]){
        var file = files[0].name;
        var command = 'clear_coords ' + file;
        sendCommand(command);
    }
}

function mergeFilesRequest(){
    // MERGE FILES
    clearErrors();
    var files = processingContainer.files;

    if(files.length < 2){
        setError('merge', 'At least 2 files must be selected!'); return null;
    }

    if(files.length > 1){
        files = files.map(function(x){ return x.name }).join(' ');
        var command = 'combine_files ' + files;
        sendCommand(command);
    }
}

function getDataRequest(){
    // GET DATA
    if(actionError){
        setError('action', actionError);
        return null;
    }

    var files = processingContainer.files;

    var actionInputs = document.getElementsByName('actionInput');
    var language = document.getElementById('languageInput').value.toLowerCase();
    var fileFrom = files[0] ? files[0].name : null;
    var fileTo, command;

    if(actionInputs[0].checked){
        fileTo = language.toLowerCase() + FILE_NAMES.pages;
        command = 'get_all_pages ' + fileTo + ' ' + language;
        sendCommand(command);
    }
    else if(actionInputs[1].checked){
        if(files.length > 0){
            fileTo = language.toLowerCase() + FILE_NAMES.coordinates;
            command = 'get_page_coordinates ' + fileFrom + ' ' + fileTo + ' ' + language;
            sendCommand(command);
        }
    }
    else if(actionInputs[2].checked){
        if(files.length > 0){
            fileTo = language.toLowerCase() + FILE_NAMES.revisions;
            command = 'get_revisions ' + fileFrom + ' ' + fileTo + ' ' + language;
            sendCommand(command);
        }
    }
}
