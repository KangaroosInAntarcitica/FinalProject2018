from sys import path
import time
path.append('..\\..\\modules')
import pandas
import wikiAPI

"""
This code can be used to get all pages for a specific language
"""

FILE_FROM = '%s_all_page_coords_clear.csv'
FILE_TO = '%s_%s_revisions.csv'
LANG = 'uk'
DIRECTION = 'older'
STATE_FILE = 'temp.txt'


def get_revisions(file_from=None, file_to=None,
                  language=LANG, state_file=STATE_FILE, direction=None):

    assert isinstance(language, str) and len(language) == 2, \
        'Language should be a 2 char code: en, uk, etc.'
    assert file_from is None or isinstance(file_from, str), \
        'File should be file path string.'
    assert file_to is None or isinstance(file_to, str), \
        'File should be file path string'
    assert isinstance(state_file, str), \
        'State File should be file path string.'
    assert direction in ('older', 'newer', None), \
        'Wrong direction %s - can be older or newer' % direction

    direction = direction if direction else DIRECTION
    file_from = file_from if file_from else FILE_FROM % language
    file_to = file_to if file_to else FILE_TO % (language, direction)

    dataframe = pandas.read_csv(file_from, sep='\t')
    dataframe = dataframe.astype({'pageid': 'int64'})
    pageid = dataframe['pageid']

    params = {
        'prop': 'revisions',
        'rvprop': 'user|timestamp',
        'pageids': pageid
    }

    response_table = {
        'revisions': {
            'pageid': 'int64',
            'ns': 'int64',
            'title': str,
            'user': str,
            'userhidden': str,
            'anon': bool,
            'timestamp': object
        }
    }

    custom = {
        'revisions': {
            'timestamp': wikiAPI.to_date
        }
    }

    response = wikiAPI.WikiResponse(response_table,
                                    custom=custom, file=file_to)

    request = wikiAPI.WikiSafeRequestMultiplePage(
        params,
        on_response=response,
        state_file=state_file,
        max=50
    )
    request.language = language
    request.send_all()

    response.save()
    print(response.show())


def timeit(func, *args, **kwargs):
    start = time.time()

    func(*args, **kwargs)

    print('Time elapsed in this session: ')
    print(time.strftime('%H:%M:%S', time.gmtime(time.time() - start)))


if __name__ == '__main__':
    timeit(get_revisions)