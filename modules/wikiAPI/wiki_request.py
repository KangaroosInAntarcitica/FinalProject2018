import requests
import pandas
from .wiki_defaults import *
from .wiki_exceptions import *


class WikiRequest:
    def __init__(self, params, on_response, *args, **kwargs):
        """
        params - request url parameters
        on_response - function or object with update function
        """
        # set to defaults + as required in params
        self.params = dict(PARAMETERS.items() | params.items())
        self.user_agent = USER_AGENT
        self.timeout = TIMEOUT
        self.language = 'en'

        # continue
        self.resume = True
        self.on_response = on_response
        self.count = 0

        if 'pageids' in params and 'titles' in params:
            raise WikiWrapperWarning('Should be either pageids or titles')

    def get_url(self):
        """ Returns the url according to current language set """
        return WIKI_URL % self.language

    def send(self):
        """
        Sends the request (if resume is True and continue parameters were set,
        will continue the previous request)
        """
        # predefine some stuff
        self.resume = False
        headers = {'User-Agent': USER_AGENT}

        response = requests.get(self.get_url(),
                                params=self.params,
                                headers=headers,
                                verify=True,
                                timeout=self.timeout)
        response = response.json()

        # Any possible errors
        if 'error' in response:
            if response['error']['info'] in \
                    ('HTTP request timed out.', 'Pool queue is full'):
                raise WikiTimeout('Timeout')
            else:
                raise WikiError(response['error']['info'])
        if 'warnings' in response:
            raise QueryWarnings(response['warnings'])
        if 'errors' in response:
            raise QueryErrors(response['errors'])

        # if there is data given
        if 'query' in response:
            query = response['query']

            if hasattr(self.on_response, 'update'):
                self.on_response.update(query)
            else:
                self.on_response(query)
            self.count += 1

        # check whether continue available
        if not('batchcomplete' in response and response['batchcomplete']):
            if 'continue' in response and response['continue']:
                # set the continue to required parameters and resume to True
                self.resume = True
                for key, value in response['continue'].items():
                    self.params[key] = value

    def send_all(self):
        print('Started sending requests!')

        while self.resume:
            print('\rRequest #%7.0d' % self.count, end='')
            self.send()

        print('\n')


class WikiRequestMultiplePage(WikiRequest):
    def __init__(self, params, on_response, max=50, *args, **kwargs):
        """
        Initialises the wiki request with functionality to send repuests
        for multiple pages
        """
        if 'pageids' in params and 'titles' in params:
            raise WikiWrapperWarning('Should be either pageids or titles')
        elif 'pageids' in params:
            self.multiple_param_type = 'pageids'
            self.multiple_params = params['pageids']
            params['pageids'] = ''
        elif 'titles' in params:
            self.multiple_param_type = 'titles'
            self.multiple_params = params['titles']
            params['titles'] = ''

        self.current_page = 0
        self.max = max
        super().__init__(params, on_response)

    def send(self):
        """
        Sends the request
        """
        if isinstance(self.multiple_params, (str, int, float)):
            current = self.multiple_params
        elif isinstance(self.multiple_params, (list, tuple, pandas.Series)):
            current = '|'.join(self.multiple_params
                               [self.current_page:self.current_page + self.max])
        else:
            raise ValueError('Mult. parm can only be list, tuple, series')

        # change the parameter of the request and send it
        self.params[self.multiple_param_type] = current
        super().send()

        # modify resume
        self.current_page += self.max
        if self.current_page < len(self.multiple_params):
            self.resume = True
