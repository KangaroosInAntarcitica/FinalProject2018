import os
import glob


FILES_DIR = '..\\wikiAPIFiles'
SERVER_DIR = '..\\server'


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


def get_all_files():
    """ Returns info about all files """
    os.chdir(FILES_DIR)
    all_files = {'files': []}

    for file_name in glob.glob('*.*'):
        all_files['files'].append(file_info(file_name))

    os.chdir(SERVER_DIR)
    return all_files


if __name__ == '__main__':
    print(get_all_files())
