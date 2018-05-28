from sys import path
import time
path.append('..\\')
import pandas
import wikiAPI
from change_path import *


"""
This code can be used to get all pages for a specific language
"""

FILE_FROM = '%s_all_pages.csv'
FILE_TO = '%s_coordinates.csv'
LANG = 'uk'


def get_page_coordinates(file_from=None, file_to=None,
                  language=LANG, state_file=None):

    if not (isinstance(language, str) and len(language) == 2):
        raise ValueError('Language should be a 2 char code: en, uk, etc.')
    if not (file_from is None or isinstance(file_from, str)):
        raise ValueError('File should be file path string.')
    if not (file_to is None or isinstance(file_to, str)):
        raise ValueError('File should be file path string')
    if not (isinstance(state_file, str) or state_file is None):
        raise ValueError('State File should be file path string.')
    file_from = file_from if file_from else FILE_FROM % language
    file_to = file_to if file_to else FILE_TO % language

    to_files()

    dataframe = pandas.read_csv(file_from, sep='\t')
    dataframe = dataframe.astype({'pageid': 'int64'})
    pageid = dataframe['pageid']

    params = {
        'prop': 'revisions',
        'rvprop': 'content',
        'pageids': pageid
    }

    response_table = {
        'revisions': {
            'pageid': 'int64',
            'ns': 'int64',
            'title': str,
            'coordinates': str,
            'lat': 'float64',
            'long': 'float64'
        }
    }

    custom = {
        'revisions': {
            ('coordinates', 'lat', 'long'): wikiAPI.get_coordinates_data
        }
    }

    response = wikiAPI.WikiResponse(response_table,
                                    custom=custom, file=file_to)
    print(response)

    request = wikiAPI.WikiSafeRequestMultiplePage(
        params,
        language,
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
    timeit(get_page_coordinates, language='en')
