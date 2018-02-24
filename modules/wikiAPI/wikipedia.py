import requests
from wiki_defaults import *


def set_lang(lang):
    """ Set the global language parameter """
    global WIKI_URL
    WIKI_URL = f'http://{lang}.wikipedia.org/w/api.php'

def set_user_agent(user_agent):
    """ Set the global user agent parameter """
    global USER_AGENT
    USER_AGENT = user_agent

def set_timeout(request_timeout):
    """ Set the global REQUEST_TIMEOUT parameter """
    REQUEST_TIMEOUT = request_timeout

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
    for key in default_parameters:
        params[key] = params.get(key, default_parameters[key])

    # check whether parameters are right or not
    if validate:
        check_params(params, possible_params)

    response = requests.get(WIKI_URL, params=params, headers=headers,
                     verify=True, timeout=REQUEST_TIMEOUT).json()

    # check for any errors
    if 'error' in response:
        if response['error']['info'] in \
                ('HTTP request timed out.', 'Pool queue is full'):
                raise Exception('Request timed out. Try again later')
        else:
            raise Exception('Unknown error occured!')

    return response

