import pandas
from numpy import NaN
from .wiki_defaults import *
from .wiki_exceptions import *

class WikiResponseProp:
    def __init__(self, response_table, custom=None):
        """ Initiate the pages, revisions """
        # create the pages dataframe
        columns = RESPONSE['pages']
        self.pages = pandas.DataFrame(columns=columns.keys())
        self.pages = self.pages.astype(columns)

        # create the revisions dataframe
        columns = response_table['revisions']
        self.revisions = pandas.DataFrame(columns=columns.keys())
        self.revisions = self.revisions.astype(columns)

        self.response_table = response_table
        self.custom = custom or dict()


    def update(self, query):
        """
        Updates all the dataframes (pages & revisions)
        """
        if 'pages' in query:
            self.update_pages(query['pages'])

    def update_pages(self, pages):
        """ Updates all the data in pages dataframe """
        for page in pages:
            if 'missing' in page and page['missing'] is True:
                raise WikiPageError(page['pageid'] if 'pageid' in page else None,
                                    page['title'] if 'title' in page else None)

            if not (self.pages.pageid == page['pageid']).any():
                # page does not exist
                page_item = [*map(lambda x: page[x], self.pages.columns)]
                self.pages.loc[len(self.pages)] = page_item

            if 'revisions' in page:
                self.update_revisions(page)

    def update_revisions(self, page):
        """ Upadtes all the data in the revisions dataframe """
        for revision in page['revisions']:
            rev_item = []

            custom_items = {}
            # if a function needs to be called to make a custom key
            if 'revisions' in self.custom:
                for key, value in self.custom['revisions'].items():
                    result = value(revision, page)

                    if isinstance(key, tuple):
                        for num, item in enumerate(key):
                            custom_items[item] = result[num]
                    else:
                        custom_items[key] = result

            # get all the required keys as a list
            for key in self.response_table['revisions']:
                # if in custom
                if key in custom_items:
                    rev_item.append(custom_items[key])
                elif key in page:
                    rev_item.append(page[key])
                elif key in revision:
                    rev_item.append(revision[key])
                else:
                    rev_item.append(NaN)

            # append the keys to the list as a row
            self.revisions.loc[len(self.revisions)] = rev_item

    def show(self):
        return pandas.merge(self.pages, self.revisions, on='pageid')


class WikiResponseList:
    def __init__(self, response_table, custom=None):
        """ Initialise the current list dataframe """
        # take only the first valid list value
        for key in response_table:
            if key in possible_params['list']:
                self.list_name = key
                break
        else:
            raise ValueError('a valid list should be in the response_table')

        # create the list dataframe
        columns = response_table[self.list_name]
        self.list = pandas.DataFrame(columns=columns.keys())
        self.list = self.list.astype(columns)

        self.response_table = response_table
        self.custom = custom or dict()

    def update(self, query):
        """
        Updates the list dataframe if it is in the result
        """
        if self.list_name in query:
            self.update_list(query[self.list_name])

    def update_list(self, lists):
        for list in lists:
            list_item = []

            custom_items = {}
            # if a function needs to be called to make a custom key
            if self.list_name in self.custom:
                for key, value in self.custom[self.list_name].items():
                    result = value(list)

                    if isinstance(key, tuple):
                        for num, item in enumerate(key):
                            custom_items[item] = result[num]
                    else:
                        custom_items[key] = result

            # get all the required keys as a list
            for key in self.response_table[self.list_name]:
                # if in custom
                if key in custom_items:
                    list_item.append(custom_items[key])
                elif key in list:
                    list_item.append(list[key])
                else:
                    list_item.append(NaN)

            # append the keys to the list as a row
            self.list.loc[len(self.list)] = list_item

    def show(self):
        return self.list
