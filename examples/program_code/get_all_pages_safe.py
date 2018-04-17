from sys import path
import time
path.append('..\\..\\modules')
import wikiAPI

"""
This code can be used to get all pages for a specific language
"""

FILE = '%s_all_pages_safe.csv'
LANG = 'uk'
STATE_FILE = 'temp.txt'


def get_all_pages(file=None, language=LANG, state_file=STATE_FILE):
    assert isinstance(language, str) and len(language) == 2, \
        'Language should be a 2 char code: en, uk, etc.'
    assert file is None or isinstance(file, str), \
        'File should be file path string.'
    assert isinstance(state_file, str), \
        'State File should be file path string.'
    file = file if file else FILE % language

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


def timeit(func, *args, **kwargs):
    start = time.time()

    func(*args, **kwargs)

    print('Time elapsed in this session: ')
    print(time.strftime('%H:%M:%S', time.gmtime(time.time() - start)))


if __name__ == '__main__':
    timeit(get_all_pages, file='uk_all_pages_safe.csv')
