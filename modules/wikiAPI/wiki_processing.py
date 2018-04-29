import datetime

def get_coordinates(data_item):
    """
    Function gets all coordinates from data - page content
    """
    content = None
    if 'content' in data_item:
        content = data_item['content']
    if '*' in data_item:
        content = data_item['*']

    if content:
        for i in range(len(content) - 4):
            if content[i] == '{' and content[i + 1] == '{':
                data = content[i+2:i+100].split('}')[0]
                data = data.replace(' ', '').lower()

                if 'missing' not in data and 'unknown' not in data:
                    if data.startswith('coordinates'):
                        data = data[11:]
                        return data
                    elif data.startswith('coord'):
                        data = data[5:]
                        return data

    return None


def parse_coordinates(coordinates):
    """
    Reads coordinates string and returns numbers
    """
    if not isinstance(coordinates, str):
        return None, None

    coordinates = coordinates.split('|')

    i = 0
    while i < len(coordinates):
        coordinates[i] = coordinates[i].strip()
        if coordinates[i] in ['', 'dec', 'dms', 'dm'] or \
                coordinates[i].startswith('dim') or \
                coordinates[i].startswith('region') or \
                coordinates[i].startswith('type') or \
                coordinates[i].startswith('display') or \
                coordinates[i].startswith('title') or \
                coordinates[i].startswith('globe') or \
                coordinates[i].startswith('scale'):

            del coordinates[i]
        else:
            i += 1

    print(coordinates)
    lat, long = None, None

    if len(coordinates) == 2:
        dir = ['n', 's', 'w', 'e']
        if coordinates[0] in dir or coordinates[1] in dir:
            return None, None

        lat = float(coordinates[0])
        long = float(coordinates[1])
    elif len(coordinates) == 4:
        lat = abs(float(coordinates[0]))
        long = abs(float(coordinates[2]))
        lat = lat * (-1 if coordinates[1] == 's' else 1)
        long = long * (-1 if coordinates[3] == 'w' else 1)
    elif len(coordinates) == 6:
        lat = abs(int(coordinates[0])) + abs(float(coordinates[1])) / 60
        long = abs(int(coordinates[3])) + abs(float(coordinates[4])) / 60
        lat = lat * (-1 if coordinates[2] == 's' else 1)
        long = long * (-1 if coordinates[5] == 'w' else 1)
    elif len(coordinates) == 8:
        lat = abs(int(coordinates[0])) + \
              (abs(int(coordinates[1])) + abs(float(coordinates[2])) / 60) / 60
        long = abs(int(coordinates[4])) + \
              (abs(int(coordinates[5])) + abs(float(coordinates[6])) / 60) / 60
        lat = lat * (-1 if coordinates[3] == 's' else 1)
        long = long * (-1 if coordinates[7] == 'w' else 1)

    return lat, long


def get_coordinates_data(data_item):
    """
    Function returns 3 data pieces: coordinates - str, lat, long - float
    """
    coordinates = get_coordinates(data_item)
    try:
        lat, long = parse_coordinates(coordinates)
    except ValueError:
        lat, long = None, None

    return coordinates, lat, long


def to_date(data_item):
    """
    Function gets date from the data
    """
    return datetime.datetime.strptime\
        (data_item['timestamp'], "%Y-%m-%dT%H:%M:%SZ")
