import pandas
from numpy import NaN
from .wiki_defaults import *
from .wiki_exceptions import *
import os.path


class WikiResponse:
    def __init__(self, response_table, custom=None, file=None, save_every=100):
        """
        Initialize the current data Dataframe
        One response can only be used for either a list or prop
        """
        self.response_table = response_table
        self.custom = custom or dict()
        self.file, self.save_every = file, save_every

        self.count = 0

        self._get_data_name()
        self._init_data()

    def _get_data_name(self):
        """
        Used when initializing only
        Gets the name and type of list OR prop given by user
        """
        # Find all the list and prop values
        values = [*filter(
            lambda x: x in all_params['list'] or x in all_params['prop'],
            self.response_table)]
        if len(values) != 1:
            raise ValueError('Only and only one list or prop arg allowed!')

        # get all the information about data
        self.data_name = values[0]
        self.data_type = 'prop' if values[0] in all_params['prop'] else 'list'

    def _init_data(self):
        """
        Used when initializing only
        Creates a dataframe representing current data
        """
        # get all the required for this
        columns = self.response_table[self.data_name]

        if self.file and os.path.isfile(self.file):
            # open the file as data if it exists
            self.data = pandas.read_csv(self.file, sep='\t')

            # add extra columns if needed
            for item in columns:
                if item not in self.data.columns:
                    self.data[item] = NaN
        else:
            # create new if no such file exists
            self.data = pandas.DataFrame(columns=columns.keys())

        # change data types
        if isinstance(columns, dict):
            self.data = self.data.astype(columns)

    def update(self, query):
        """
        Updates all the data according to query
        """
        if self.data_type == 'prop':
            if 'pages' in query:
                self.update_pages(query['pages'])

        elif self.data_type == 'list':
            if self.data_name in query:
                self.update_data(query[self.data_name])

        # Increment the number of requests handled
        self.count += 1
        # Save if needed
        if self.file and self.count % self.save_every == 0:
            self.save()

    def update_pages(self, pages):
        """
        Updates all the data with pages
        Can be used to separately save the pages data
        """
        for page in pages:
            # if pages was a dict - sometimes happens
            if isinstance(page, (int, str)):
                page = pages[page]

            # If an error occurred with the page
            if 'missing' in page and page['missing'] is True:
                raise WikiPageError(
                    page['pageid'] if 'pageid' in page else None,
                    page['title'] if 'title' in page else None
                )

            # If we have our data, update it
            if self.data_name in page:
                self.update_data(page[self.data_name], page)

    def update_data(self, data, page=None):
        # Create a dict for all the information
        all_data = {x: [] for x in self.response_table[self.data_name]}

        for data_item in data:
            custom_item = {}

            # if a function needs to be called to make a custom key
            if self.data_name in self.custom:
                for key, value in self.custom[self.data_name].items():
                    if value.__code__.co_argcount == 1:
                        result = value(data_item)
                    else:
                        result = value(data_item, page)

                    if isinstance(key, tuple):
                        for num, value_name in enumerate(key):
                            custom_item[value_name] = result[num]
                    else:
                        custom_item[key] = result

            # get all the required keys as a list
            for key in self.response_table[self.data_name]:
                # if in custom
                if key in custom_item:
                    if custom_item[key] is None:
                        custom_item[key] = NaN
                    all_data[key].append(custom_item[key])
                elif key in data_item:
                    all_data[key].append(data_item[key])
                elif page and key in page:
                    all_data[key].append(page[key])
                else:
                    all_data[key].append(NaN)

        # append all the data to dataframe
        self.data = self.data.append(
            pandas.DataFrame(all_data),
            ignore_index=True
        )

    def show(self):
        return self.data

    def save(self):
        print('\tSaving!\t', end='')

        with open(self.file, 'w', encoding='utf-8') as file:
            # remove duplicates and save
            self.data = self.data.drop_duplicates()
            self.data.to_csv(file, index=False, header=True, sep='\t')

        print('\r', end='')


class WikiResponsePages(WikiResponse):
    """
    This class is used for handling data from responses, but has an extra
    attribute for getting all the data about pages
    """
    def __init__(self, *args, pages_file=None, **kwargs):
        """
        Initialize the data and pages dataframes
        One response can only be used for either a list or prop
        """
        super().__init__(*args, **kwargs)
        self.pages_file = pages_file

        # get all the default column names for pages
        self.page_columns = RESPONSE['pages']

        if self.pages_file and os.path.isfile(self.pages_file):
            # if file exists, open it and use as pages dataframe
            self.pages = pandas.pandas.read_csv(self.page_file, sep='\t')

            # add extra columns if needed
            for item in self.page_columns:
                if item not in self.pages.columns:
                    self.pages.columns[item] = NaN

        else:
            # create new if no such file exists
            self.pages = pandas.DataFrame(columns=self.page_columns.keys())

        self.pages = self.pages.astype(self.page_columns)

    def update_pages(self, pages):
        """ Update the pages dataframe with data received """
        # create a dict to store all the data, got
        all_pages = {x: [] for x in self.page_columns}

        # get all the page data
        for page in pages:
            # if pages is an object and not an array
            if isinstance(page, (int, str)):
                page = pages[page]

            for key in all_pages:
                if key in page:
                    all_pages[key].append(page[key])
                else:
                    all_pages[key].append(NaN)

        # append all the data to dataframe
        self.pages = self.pages.append(
            pandas.DataFrame(all_pages),
            ignore_index=True
        )

        super().update_pages(pages)

    def show(self):
        return pandas.merge(self.pages, self.data, on='pageid')

    def save(self):
        """ Saves the data to pages_file """
        with open(self.pages_file, 'w', encoding='utf-8') as file:
            # remove duplicates and save
            self.pages = self.pages.drop_duplicates()
            self.pages.to_csv(file, index=False, header=True, sep='\t')

        super().save()
