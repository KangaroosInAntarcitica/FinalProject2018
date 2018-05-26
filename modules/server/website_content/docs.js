var content = document.getElementsByClassName('content')[0];


var settings = {
    fileElements: {'Pages': ['pageid', 'title'], 'Coordiantes': 'coordinates',
        'Authors': 'user', 'Timestamp': 'timestamp'},
    globalDescription: null
};


function createFileDescription(file){
    // Function creates a new description object from file
    file = file || {};

    var description = document.createElement('div');
    description.classList.add('fileDescription');
    description.onclick = function(event){ event.stopPropagation(); };

    var name = document.createElement('div');
    name.classList.add('name');
    name.innerText = file.name || 'File name';
    description.appendChild(name);


    for(var i in settings.fileElements){
        var new_data = document.createElement('div');
        new_data.classList.add('horizontal');
        new_data.appendChild(document.createElement('div'));
        new_data.children[0].classList.add('descriptionItem');
        new_data.children[0].innerText = i;
        new_data.appendChild(document.createElement('div'));
        new_data.children[1].classList.add('descriptionItem');

        description.appendChild(new_data);
    }

    var button = document.createElement('button');
    button.innerText = 'Open on map!';
    description.appendChild(button);
    changeFileDescription(file, description);

    return description;
}

function changeFileDescription(file, description){
    // Function changes file description according to the file
    file = file || {};
    description = description || settings.globalDescription;

    var name = description.getElementsByClassName('name')[0];
    name.innerText = file.name || 'File name';

    var children = description.getElementsByClassName('descriptionItem');
    console.log(children);
    var elements = settings.fileElements;
    var elementNames = Object.getOwnPropertyNames(elements);
    for(var i = 0; i < elementNames.length; i++){
        var key = elementNames[i];
        elements[key] = elements[key] instanceof Array ?
            elements[key] : [elements[key]];
        var fileHas = elements[key].every((x) => !!file[x] );

        children[i * 2].innerText = elementNames[i];
        children[i * 2 + 1].innerText = fileHas ? 'true' : 'false';
    }

    var button = description.getElementsByTagName('button')[0];
    button.onclick = location.assign.bind(this, '/map/' + file.name);

    return description;
}

function deselectAllFiles(){
    // deselects all files
    var file_elements = document.getElementsByClassName('file');

    for(var i = 0; i < file_elements.length; i++){
        file_elements[i].classList.remove('selected');
    }

    var fileDescription = settings.globalDescription;
    fileDescription.style.pointerEvents = 'none';
    fileDescription.style.opacity = '0';
}

function selectFile(fileElement, file, event){
    // displays information about file and selects it
    // create new description if none exists
    if(!settings.globalDescription){
        // create new description
        var new_description = createFileDescription();
        new_description.style.position = 'fixed';
        new_description.style.opacity = '0';
        new_description.style.pointerEvents = 'none';
        new_description.classList.add('fileDescription');
        settings.globalDescription = new_description;
        document.body.appendChild(new_description);

        document.body.onclick = deselectAllFiles;
    }

    deselectAllFiles();
    fileElement.classList.add('selected');

    var x = event.x - 40,
        y = fileElement.getBoundingClientRect().bottom + 4;

    var fileDescription = settings.globalDescription;
    fileDescription.style.top = y + 'px';
    fileDescription.style.left = x + 'px';
    fileDescription.style.opacity = '1';
    fileDescription.style.pointerEvents = 'all';

    event.stopPropagation();
    changeFileDescription(file);
    event.stopPropagation();
}

function createFile(file, button, buttonClick){
    // Function creates a file with a button on the left
    // button can be: 'add', 'remove', ''
    var new_container = document.createElement('div');
    new_container.classList.add('fileContainer');

    var new_button = document.createElement('button');
    if(button === 'remove'){
        new_button.innerText = 'X';
        new_button.style.fontSize = '14px';
    }
    if(button === 'add') {
        new_button.innerText = '+';
    }
    new_button.classList.add('addFile');

    var new_element = document.createElement('div');
    new_element.innerText = file.name || 'File name';
    new_element.classList.add('file');

    if(buttonClick)
        new_button.onclick = buttonClick.bind(this, new_element, file);
    new_element.onclick = selectFile.bind(this, new_element, file);

    if(button){
        new_container.appendChild(new_button);
    }
    new_container.appendChild(new_element);
    return new_container;
}


function createFileContainer(files, button) {
    var fileContainer = document.createElement('div');
    fileContainer.style.display = 'flex';
    fileContainer.style.flexDirection = 'column';
    fileContainer.innerHTML = '';
    fileContainer.files = files || [];

    fileContainer.buttonClick = (function(fileElement, file){
        fileContainer.onclick(fileElement, file);
    }).bind(fileContainer);

    fileContainer.update = (function(files){
        files = files || this.files;
        // Clear the files
        console.log(files);
        files = files.filter(function(item){
            var name = item.name;
            var length = item.name.length;
            return name.slice(length - 4, length).toLowerCase() === '.csv'
        });

        this.innerHTML = '';
        if(files.length === 0){
            var empty_element = document.createElement('div');
            empty_element.classList.add('emptyFile');
            empty_element.innerText = 'Empty - nothing to show';

            this.appendChild(empty_element);
        }
        for (var i = 0; i < files.length; i++) {
            this.appendChild(createFile(files[i], button, this.buttonClick));
        }
    }).bind(fileContainer);
    fileContainer.update(fileContainer.files);

    fileContainer.add = (function(fileElement, file){
        console.log(fileElement, file);
        if(! this.files.some(function(item){ return item.name === file.name; }))
            this.files.push(file);
        this.update(this.files);
    }).bind(fileContainer);

    fileContainer.remove = (function(fileElement, file){
        var new_files = [];
        for(var i = 0; i < this.files.length; i++){
            if(this.files[i].name !== file.name)
                new_files.push(this.files[i]);
        }
        this.files = new_files;
        this.update(this.files);
    }).bind(fileContainer);

    return fileContainer;
}
