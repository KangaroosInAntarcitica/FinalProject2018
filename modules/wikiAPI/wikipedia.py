import requests
from .wiki_defaults import *


def set_lang(lang):
    """ Set the global language parameter """
    global WIKI_URL
    WIKI_URL = f'http://{lang}.wikipedia.org/w/api.php'

def set_user_agent(user_agent):
    """ Set the global user agent parameter """
    global USER_AGENT
    USER_AGENT = user_agent

def set_timeout(request_timeout):
    """ Set the global TIMEOUT parameter """
    TIMEOUT = request_timeout

def check_params(params, possible_params):
    """ Function to check for parameter validity. """
    for key in possible_params:
        if (key in params) and (params[key] not in possible_params[key]):
            message = f'Invalid param for {key} - {params[key]}' + \
                '\nSet the validate=False flag to ignore param errors' + \
                f'\nPossible params: {possible_params[key]}'
            raise ValueError(message)


def wiki_request(params, validate=True):
    """ Function to send requests to Wikipedia """
    headers = { 'User-Agent': USER_AGENT }

    # set to default the parameters that could not be found
    for key in PARAMETERS:
        params[key] = params.get(key, PARAMETERS[key])

    # check whether parameters are right or not
    if validate:
        check_params(params, all_params)

    response = requests.get(WIKI_URL, params=params, headers=headers,
                     verify=True, timeout=TIMEOUT).json()

    # check for any errors
    if 'error' in response:
        if response['error']['info'] in \
                ('HTTP request timed out.', 'Pool queue is full'):
                raise Exception('Request timed out. Try again later')
        else:
            raise Exception('Unknown error occured!')

    return response


def wiki_languages():
    """ Function returns all wikipedia language codes available """
    params = { 'meta': 'siteinfo', 'siprop': 'languages' }
    response = wiki_request(params)

    return [lang['code'] for lang in response['query']['languages']]


def wiki_pages(continue_param=None):
    """ Function returns a list of all Wikipedia page ids """
    params = {
        'list': 'allpages',
        'aplimit': 'max',
        'continue': continue_param
    }

    response = wiki_request(params)
    if 'continue' in response and 'apcontinue' in response['continue']:
        continue_result = response['continue']['apcontinue']
    else:
        continue_result = None

    result = [page['pageid'] for page in response['query']['allpages']]
    return result, continue_result


def wiki_page(pageids=None, titles=None, revids=None, prop=['content'], limit=None):
    """
    Function that returns all revisions of a page
    pageids, titles, revids - parameters, that define what page or revision
    do you want to get
    prop - parameter that defines what exactly you want to get from the page
    (user, content, timestamp, etc.)
    limit - how many results you want to get (Wikipedia API defaults to 1)
    """
    if not(pageids or titles or revids):
        raise ValueError('Either page name, id or revision id should be set')

    params = {
        'prop': 'revisions',
        'rvprop': '|'.join(prop),
        'titles': '|'.join(titles) if titles else None,
        'pageids': '|'.join(pageids) if pageids else None,
        'revids': '|'.join(revids) if revids else None,
        'rvlimit': limit
    }

    response = wiki_request(params)
    print(response)

    pages = response['query']['pages']
    result = {}

    for item in pages:
        result[item['pageid'] or item['title']] = item['revisions']

    return result
