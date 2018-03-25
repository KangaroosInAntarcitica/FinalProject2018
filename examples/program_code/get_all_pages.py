from sys import path
import time
path.append('..\\..\\modules')
import wikiAPI

FILE = '%s_all_pages.csv'
LANG = 'uk'

def get_all_pages(file=None, language=LANG):
    assert isinstance(language, str) and len(language) == 2, \
        'Language should be a 2 char code: en, uk, etc.'
    assert isinstance(file, (str, None)), 'File should be file path string.'
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

    response = wikiAPI.WikiResponseList(response_table, file=file)

    request = wikiAPI.WikiRequest(params, on_response=response)
    request.language = language
    request.send_all()

    response.save()
    print(response.show())


if __name__ == '__main__':
    get_all_pages()
