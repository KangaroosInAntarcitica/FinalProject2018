import json
from os import path


def convert(file_name, save=False, *args, **kwargs):
    if file_name[-4:] == 'json':
        file_name = file_name[:-4] + 'csv'
    write_file_name = file_name.replace('csv', 'json')

    file = open(file_name, 'r', encoding='utf-8')
    data = file.read()

    def get_coords(line):
        line = line.split('\t')
        if len(line) >= 6:
            # !!! coordinates should be reversed here !!!
            coords = [*map(float, [line[2], line[1]])]
            title = line[5]

            point = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': coords
                },
                'properties': {
                    'title': title
                }
            }
            return point

    data = data.split('\n')[1:]
    data = [*map(get_coords, data)][:-1]
    data = data[:2000]
    data = {'type': 'FeatureCollection', 'features': data}

    if save:
        with open(write_file_name, 'w', encoding='utf-8') as file:
            json.dump(data, file)
        return open(write_file_name, 'r', encoding='utf-8').read()
    else:
        return json.dumps(data)
