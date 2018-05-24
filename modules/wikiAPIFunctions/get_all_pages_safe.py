from sys import path
import time
path.append('..\\')
import wikiAPI
from change_path import *

"""
This code can be used to get all pages for a specific language
"""

FILE = '%s_all_pages_safe.csv'
LANG = 'uk'
STATE_FILE = 'temp.txt'


def get_all_pages(file=None, language=LANG, state_file=STATE_FILE):
    if not (isinstance(language, str) and len(language) == 2):
        raise ValueError('Language should be a 2 char code: en, uk, etc.')
    if not(file is None or isinstance(file, str)):
        raise ValueError('File should be file path string.')
    if not isinstance(state_file, str):
        raise ValueError('State File should be file path string.')
    file = file if file else FILE % language

    to_files()

    params = {
        'list': 'allpages',
        'aplimit': 'max',
        'apfilterredir': 'nonredirects',
        'apcontinue': ''
    }

    response_table = {
        'allpages': {
            'pageid': 'int64',
            'ns': 'int64',
            'title': str
        }
    }

    response = wikiAPI.WikiResponse(response_table, file=file)

    request = wikiAPI.WikiSafeRequest(
        params,
        on_response=response,
        state_file=state_file
    )
    request.language = language
    request.send_all()

    response.save()
    print(response.show())

    to_functions()


def timeit(func, *args, **kwargs):
    start = time.time()

    func(*args, **kwargs)

    print('Time elapsed in this session: ')
    print(time.strftime('%H:%M:%S', time.gmtime(time.time() - start)))


if __name__ == '__main__':
    timeit(get_all_pages, language='ru')
