import os
import glob


FILES_DIR = '..\\wikiAPIFiles'
SERVER_DIR = '..\\server'
TEMP_FILE = 'temp.txt'


def file_info(file_name):
    file = open(file_name, 'r', encoding='utf-8')
    header = [*map(lambda x: x.strip().lower(), file.readline().split('\t'))]
    file.close()

    information = {
        'name': file_name,
        'pageid': 'pageid' in header,
        'title': 'title' in header,
        'coordinates': 'lat' in header and 'long' in header,
        'user': 'user' in header,
        'timestamp': 'timestamp' in header
    }

    return information


def read_temp(files, temp_file):
    """
    Reads file with information and adds it to corresponding file
    """
    def add_file_info(info):
        if 'file' not in info:
            return

        for file in files:
            if file['name'] == info['file']:
                current = file
                break
        else:
            current = dict()
            files.append(current)

        current['count'] = info['count']
        if 'resume' in info:
            current['not_finished'] = info['resume']
        if 'current_page' in info:
            current['current_page'] = info['current_page']
        if 'max_page' in info:
            current['max_page'] = info['max_page']
        if 'max' in info:
            current['max_every'] = info['max']

    with open(temp_file, 'r', encoding='utf-8') as file:
        for line in file:
            line = line.strip().split('\t')
            if len(line) < 2:
                continue

            saved_repr = eval(line[1])
            if isinstance(saved_repr, dict):
                add_file_info(saved_repr)

    return files


def get_all_files():
    """ Returns info about all files """
    os.chdir(FILES_DIR)
    all_files = {'files': []}

    for file_name in glob.glob('*.*'):
        all_files['files'].append(file_info(file_name))

    if TEMP_FILE in glob.glob('*.*'):
        read_temp(all_files['files'], TEMP_FILE)

    os.chdir(SERVER_DIR)
    return all_files


if __name__ == '__main__':
    print(get_all_files())
