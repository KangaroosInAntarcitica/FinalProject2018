import pandas
import os.path
from .wiki_defaults import *
from .wiki_request import *
from .wiki_exceptions import *


class SafeRequest:
    """
    An abstract class to be used to store and restore data about current
    request. It saves all the parameters (except for titles and 'pageids'),
    count variable and the current_page variable.

    May cause unwanted errors if used in code. Use its child classes for
    safe request making.

    Specify a self.request_parent = Class variable for instances.
    """
    def __init__(self, params, on_response, state_file='temp.txt',
                 save_every=100, *args, **kwargs):
        """ Initializes the state-saving functionality """
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

        # create param_key - without titles or ids
        self.param_key = dict(params)
        if 'titles' in self.param_key and \
                not isinstance(self.param_key['titles'], str):
            del self.param_key['titles']
        elif 'pageids' in self.param_key and \
                not isinstance(self.param_key['pageids'], str):
            del self.param_key['pageids']

        # create a unique key to identify the requests of this type
        self.param_key = self.param_key.__str__()

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

    def write_file(self):
        """
        This function is responsible for writing the state_file
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
        if 'current_page' in self.__dict__:
            safe_dict['current_page'] = self.current_page
        safe_dict = safe_dict.__str__()

        result = ''

        # open and get all the previous data
        if os.path.isfile(self.state_file):
            with open(self.state_file, 'r', encoding='utf-8') as file:
                found = False
                for line in file:
                    if line[:len(self.param_key)] == self.param_key:
                        # change current state
                        result += self.param_key + ' ' + safe_dict + '\n'
                        found = True
                    elif line:
                        result += line + '\n'

                if not found:
                    result += self.param_key + ' ' + safe_dict + '\n'
        else:
            result = self.param_key + ' ' + safe_dict + '\n'

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
