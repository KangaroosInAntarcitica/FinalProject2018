import pandas
import os.path
from .wiki_defaults import *
from .wiki_request import *
from .wiki_response import *
from .wiki_exceptions import *


STATE_FILE = 'temp.txt'


class SafeRequest:
    """
    An abstract class to be used to store and restore data about current
    request. It saves all the parameters (except for titles and 'pageids'),
    count variable and the current_page variable.

    May cause unwanted errors if used in code. Use its child classes for
    safe request making.

    Specify a self.request_parent = Class variable for instances.
    """
    def __init__(self, params, language, on_response, state_file=None,
                 save_every=100, *args, **kwargs):
        """ Initializes the state-saving functionality """
        if state_file is None:
            state_file = STATE_FILE

        if not isinstance(state_file, str):
            raise ValueError('State_file should be a string.')
        if not isinstance(save_every, int):
            raise ValueError('Save_every should be a digit.')
        if hasattr(on_response, 'save_every') and \
                isinstance(on_response.save_every, int) and \
                save_every % on_response.save_every != 0:
            raise ValueError('Request and response save_every are different!')

        self.state_file = state_file
        self.save_every = save_every

        self.param_key = self.init_state_string(params, language)

    @staticmethod
    def init_state_string(params, language):
        # create param_key - without titles or ids
        param_key = dict(params)
        if 'titles' in param_key and \
                not isinstance(param_key['titles'], str):
            del param_key['titles']
        elif 'pageids' in param_key and \
                not isinstance(param_key['pageids'], str):
            del param_key['pageids']
        param_key['language'] = language

        # create a unique key to identify the requests of this type
        param_key = param_key.__str__()
        return param_key

    def _restore_state_(self):
        """ Used when initializing - restores the last saved state """
        # create a dict for all the values
        extra = {}

        # get the value from the dict if state_file exists
        if os.path.isfile(self.state_file):
            with open(self.state_file, 'r', encoding='utf-8') as file:
                for line in file:
                    if line[:len(self.param_key)] == self.param_key:
                        extra = eval(line[len(self.param_key):])

        if not isinstance(extra, dict):
            raise ValueError('File %s has errors in it' % self.state_file)

        # retrieve all the required data to restore state
        if 'count' in extra:
            self.count = extra['count']
        if 'params' in extra:
            # Take all the params - including continue parameters
            if 'pageids' in self.params:
                extra['pageids'] = self.params['pageids']
            if 'titles' in self.params:
                extra['titles'] = self.params['titles']

            self.params = extra['params']
        if 'current_page' in extra:
            self.current_page = extra['current_page']

        self.resume = True

    def send(self):
        """
        Safely send the request
        Save - every [self.save_every] requests or if error occurred
        If error occurred - saves state only if corresponding response
        handler performs the save.
        """
        try:
            self.request_parent.send(self)
        except BaseException:
            # save, if such an option is available
            if hasattr(self.on_response, 'update') and \
                    hasattr(self.on_response, 'save'):
                self.on_response.save()
                self.write_file()
            raise

        if self.count % self.save_every == 0 and self.count != 0:
            self.write_file()
        if not self.resume:
            if hasattr(self.on_response, 'update') and \
                    hasattr(self.on_response, 'save'):
                self.on_response.save()
                self.write_file()

    def current_state_string(self):
        """
        Writes current state in form of string, so that it can be later
        restored
        """
        safe_dict = {}
        if 'count' in self.__dict__:
            safe_dict['count'] = self.count
        if 'params' in self.__dict__:
            safe_dict['params'] = dict(self.params)
            if 'pageids' in safe_dict['params']:
                del safe_dict['params']['pageids']
            if 'titles' in safe_dict['params']:
                del safe_dict['params']['titles']
        if 'resume' in self.__dict__:
            safe_dict['resume'] = self.resume
        if 'current_page' in self.__dict__:
            safe_dict['current_page'] = self.current_page
        if 'multiple_params' in self.__dict__:
            safe_dict['max_page'] = self.multiple_params.size
        if 'max' in self.__dict__:
            safe_dict['max'] = self.max
        if isinstance(self.on_response, WikiResponse) and \
                hasattr(self.on_response, 'file'):
            safe_dict['file'] = self.on_response.file
        safe_dict = safe_dict.__str__()

        return safe_dict

    def write_file(self):
        """
        This function is responsible for writing the state_file
        """
        safe_dict = self.current_state_string()
        result = ''

        # open and get all the previous data
        if os.path.isfile(self.state_file):
            with open(self.state_file, 'r', encoding='utf-8') as file:
                found = False
                for line in file:
                    line = line.strip()
                    if line[:len(self.param_key)] == self.param_key:
                        # change current state
                        result += self.param_key + '\t' + safe_dict + '\n'
                        found = True
                    elif line:
                        result += line + '\n'

                if not found:
                    result += self.param_key + '\t' + safe_dict + '\n'
        else:
            result = self.param_key + '\t' + safe_dict + '\n'

        with open(self.state_file, 'w', encoding='utf-8') as file:
            file.write(result)


class WikiSafeRequest(WikiRequest, SafeRequest):
    """ A class for safely sending WikiRequest """
    def __init__(self, *args, **kwargs):
        self.request_parent = WikiRequest

        SafeRequest.__init__(self, *args, **kwargs)
        self.request_parent.__init__(self, *args, **kwargs)
        SafeRequest._restore_state_(self)

    def send(self):
        SafeRequest.send(self)


class WikiSafeRequestMultiplePage(WikiRequestMultiplePage, SafeRequest):
    """ A class for safely sending WikiRequestMultiplePage """
    def __init__(self, *args, **kwargs):
        self.request_parent = WikiRequestMultiplePage

        SafeRequest.__init__(self, *args, **kwargs)
        self.request_parent.__init__(self, *args, **kwargs)
        SafeRequest._restore_state_(self)

    def send(self):
        SafeRequest.send(self)

