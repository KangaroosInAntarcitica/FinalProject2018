var content = document.getElementsByClassName('content')[0];


function createFileDescription(file){
    file = file || {};

    var description = document.createElement('div');
    description.classList.add('fileDescription');
    description.onclick = function(event){ event.stopPropagation(); };

    var name = document.createElement('div');
    name.classList.add('name');
    name.innerText = file.name || 'File name';
    description.appendChild(name);

    var elements = {'Pages': ['pageid', 'title'], 'Coordiantes': 'coordinates',
        'Authors': 'user', 'Timestamp': 'timestamp'};

    for(item of Object.getOwnPropertyNames(elements)){
        elements[item] = elements[item] instanceof Array ? elements[item] : [elements[item]];
        var file_has = elements[item].every((x) => !!file.x);

        var new_data = document.createElement('div');
        new_data.classList.add('horizontal');
        new_data.appendChild(document.createElement('div'));
        new_data.children[0].classList.add('descriptionItem');
        new_data.children[0].innerText = item;
        new_data.appendChild(document.createElement('div'));
        new_data.children[1].classList.add('descriptionItem');
        new_data.children[1].innerText = file_has ? 'true' : 'false';

        description.appendChild(new_data);
    }

    var button = document.createElement('button');
    button.innerText = 'Open on map!';
    description.appendChild(button);

    return description;
}

function createFile(file, deselect_button){
    var new_container = document.createElement('div');
    new_container.classList.add('fileContainer');

    var new_button = document.createElement('button');
    if(deselect_button){
        new_button.innerText = 'X';
        new_button.style.fontSize = '14px';
    }
    else { new_button.innerText = '+'; }
    new_button.classList.add('addFile');

    var new_element = document.createElement('div');
    new_element.innerText = file.name || 'File name';
    new_element.classList.add('file');
    new_element.setAttribute('data', file);

    // new_button.onclick = addProcessFile.bind(this, new_element, deselect_button);
    // new_element.onclick = clickFile.bind(this, new_element);

    new_container.appendChild(new_button);
    new_container.appendChild(new_element);
    return new_container;
}
