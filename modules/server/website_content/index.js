var files = [];
var filesToProcess = [];

function loadFiles(){
var request = new XMLHttpRequest();
    request.open('GET', '/files', false);
    request.send();

    if(request.status === 200){
        files = JSON.parse(request.responseText).files;
        addFiles();
    }
}


function addFiles(fileContainer, req_files, deselect_button){
    // displays files
    if(req_files === undefined){ req_files = files; }

    var cleared_files = [];
    for(var j = 0; j < req_files.length; j++){
        var item = req_files[j];
        if(item.name.slice(item.name.length - 4, item.name.length).toLowerCase() === '.csv')
            cleared_files.push(item);
    }
    req_files = cleared_files;

    fileContainer = fileContainer || document.getElementById('fileContainer');
    fileContainer.innerHTML = '';

    if(req_files.length === 0){
        var empty_element = document.createElement('div');
        empty_element.classList.add('emptyFile');
        empty_element.innerText = 'Empty - nothing to show';

        fileContainer.appendChild(empty_element);
    }

    for(var i = 0; i < req_files.length; i++){
        var file = req_files[i];
        var new_container = document.createElement('div');
        new_container.classList.add('container');

        var new_button = document.createElement('button');
        if(deselect_button){ new_button.innerText = 'X'; new_button.style.fontSize = '14px'; }
        else { new_button.innerText = '+'; }

        new_button.classList.add('addFile');

        var new_element = document.createElement('div');
        new_element.innerText = file.name;
        new_element.classList.add('file');
        new_element.setAttribute('id', file.name);

        new_button.onclick = addProcessFile.bind(this, new_element, deselect_button);
        new_element.onclick = clickFile.bind(this, new_element);

        new_container.appendChild(new_button);
        new_container.appendChild(new_element);
        fileContainer.appendChild(new_container);
    }
}

function clickFile(fileElement, event){
    // displays information about file
    deselectAllFiles();
    fileElement.classList.add('selected');

    var x = event.x - 40,
        y = fileElement.getBoundingClientRect().bottom + 4;

    var fileDescription = document.getElementById('fileDescription');
    fileDescription.style.top = y + 'px';
    fileDescription.style.left = x + 'px';
    fileDescription.style.opacity = '1';
    fileDescription.style.pointerEvents = 'all';

    event.stopPropagation();
    setFileDescription(fileElement);
}

function deselectAllFiles(){
    var file_elements = document.getElementsByClassName('file');

    for(var i = 0; i < file_elements.length; i++){
        file_elements[i].classList.remove('selected');
    }

    var fileDescription = document.getElementById('fileDescription');
    fileDescription.style.pointerEvents = 'none';
    fileDescription.style.opacity = '0';
}
document.body.onclick = deselectAllFiles;

function setFileDescription(fileElement){
    // displays description of the file in description box
    // find the file
    var name = fileElement.id;
    var file;
    for(var i = 0; i < files.length; i++){
        if(files[i].name === name) file = files[i];
    }

    var description = document.getElementById('fileDescription');
    description.getElementsByClassName('name')[0].innerText = file.name;

    var elements = description.getElementsByClassName('descriptionItem');
    elements[1].innerText = file.pageid || file.title;
    elements[3].innerText = file.coordinates;
    elements[5].innerText = file.user;
    elements[7].innerText = file.timestamp;

    description.getElementsByClassName('map')[0].onclick = function(){
        location.assign('/map/' + file.name);
    }
}

function addProcessFile(fileElement, remove){
    // adds file to selected for porcessing container
    var selectedFileContainer = document.getElementById('selectedFileContainer');

    if(remove){
        var new_files = [];
        for(var j = 0; j < filesToProcess.length; j++){
            if(filesToProcess[j].name !== fileElement.id)
                new_files.push(filesToProcess[j]);
        }
        filesToProcess = new_files;
        addFiles(selectedFileContainer, filesToProcess, true);
    }

    else {
        if(!filesToProcess) filesToProcess = [];
        var file;
        for(var i = 0; i < files.length; i++){
            if(files[i].name === fileElement.id) file = files[i];
        }

        var found = false;
        for(i = 0; i < filesToProcess.length; i++){
            if(filesToProcess[i].name === file.name) found = true;
        }

        if(!found){
            filesToProcess.push(file);
            addFiles(selectedFileContainer, filesToProcess, true);
        }
    }

    processControls();
}



// run function to load the files
loadFiles();
addFiles();
addFiles(document.getElementById('selectedFileContainer'), filesToProcess, true);


var FILE_NAMES = {
    pages: '_all_pages.csv',
    coordinates: '_coordinates.csv',
    revisions: '_revisions.csv'
};

function processControls(){
    var fileFromDiv = document.getElementById('fileFromDiv');
    var fileToDiv = document.getElementById('fileToDiv');
    var actionInputDiv = document.getElementById('actionInputs');
    var actionInputLabels = actionInputDiv.getElementsByTagName('label');

    var languageInput = document.getElementById('languageInput');
    var actionInputs = document.getElementsByName('actionInput');
    var fromInput = document.getElementById('fromInput');
    var toInput = document.getElementById('toInput');

    // single file action:
    var changeFromInput = document.getElementById('changeFromInput');
    if(filesToProcess.length > 0){
        changeFromInput.value = filesToProcess[0].name;
    } else {
        changeFromInput.value = 'None';
    }

    if(filesToProcess.length > 0){
        languageInput.value = filesToProcess[0].name.slice(0, 2);
    }

    if(filesToProcess.length > 0){
        var file = filesToProcess[0];

        if(!file.coordinates){ actionInputs[1].checked = true; }
        else { actionInputs[2].checked = true; }

        fromInput.value = file.name;
    }
    if(filesToProcess.length === 0){
        actionInputs[0].checked = true;
    }

    changeAction();
}

function changeAction(){
    var fromInput = document.getElementById('fromInput');
    var toInput = document.getElementById('toInput');
    var actionInputs = document.getElementsByName('actionInput');
    var language = document.getElementById('languageInput').value;
    var fileFromDiv = document.getElementById('fileFromDiv');
    var fileToDiv = document.getElementById('fileToDiv');

    var toFile;
    if(actionInputs[0].checked) {
        fromInput.value = 'None';
        toFile = FILE_NAMES.pages;
    }
    else if(actionInputs[1].checked){
        fromInput.value = filesToProcess[0] ? filesToProcess[0].name : 'None';
        toFile = FILE_NAMES.coordinates
    }
    else if(actionInputs[2].checked){
        fromInput.value = filesToProcess[0] ? filesToProcess[0].name : 'None';
        toFile = FILE_NAMES.revisions
    }

    toFile = language + toFile;
    toInput.value = toFile;
}

function sendCommand(command){
    command = '/function/' + command;

    var request = new XMLHttpRequest();
    request.open('GET', command, false);
    request.send();

    setTimeout(loadFiles, 500);
}

// CHANGE SINGLE FILE
function clearCoordinatesRequest(){
    if(filesToProcess[0]){
        var file = filesToProcess[0].name;
        var command = 'clear_coords ' + file;
        sendCommand(command);
    }
}

// MERGE FILES
function mergeFilesRequest(){
    if(filesToProcess.length > 1){
        var files = filesToProcess.map(function(x){ return x.name }).join(' ');
        var command = 'combine_files ' + files;
        sendCommand(command);
    }
}

function getDataRequest(){
    var actionInputs = document.getElementsByName('actionInput');
    var language = document.getElementById('languageInput').value;
    var fileFrom = filesToProcess[0] ? filesToProcess[0].name : null;
    var fileTo, command;

    if(actionInputs[0].checked){
        fileTo = language.toLowerCase() + FILE_NAMES.pages;
        command = 'get_all_pages ' + fileTo + ' ' + language;
        sendCommand(command);
    }
    else if(actionInputs[1].checked){
        if(filesToProcess.length > 0){
            fileTo = language.toLowerCase() + FILE_NAMES.coordinates;
            command = 'get_page_coordinates ' + fileFrom + ' ' + fileTo + ' ' + language;
            sendCommand(command);
        }
    }
    else if(actionInputs[2].checked){
        if(filesToProcess.length > 0){
            fileTo = language.toLowerCase() + FILE_NAMES.revisions;
            command = 'get_revisions ' + fileFrom + ' ' + fileTo + ' ' + language;
            sendCommand(command);
        }
    }
}


console.log('XML HTTP request are used, because flask works better with them.');
processControls();
