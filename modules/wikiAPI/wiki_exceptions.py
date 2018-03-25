class WikiException(Exception):
    """ All wikipedia errors """
    def __init__(self, error):
        self.error = error

    def __str__(self):
        return 'Wikipedia Error: %s' % self.error


class WikiError(WikiException):
    """ When the error attribute is in the response """
    pass


class WikiDataMissing(WikiException):
    """ When some data is missing """
    def __init__(self, data=None):
        self.error = 'Data missing, data: %s' % data


class WikiPageError(WikiDataMissing):
    """ When a page is missing """
    def __init__(self, title=None, pageid=None):
        self.error = 'Page not found, id: %s | title: %s' % \
            (pageid if pageid else 'unknown', title if title else 'unknown')


class WikiTimeout(WikiException):
    def __str__(self):
        return 'Request timed out.'


class QueryWarnings(WikiException):
    pass


class QueryErrors(WikiException):
    pass


class WikiWrapperWarning(Exception):
    """ Wikipedia errors, catched before request was sent """
    def __init__(self, error):
        self.error = error

    def __str__(self):
        return 'Wrapper Warning: %s' % self.error


class ResponseTableError(WikiWrapperWarning):
    """ When something is wrong with the response table """
    pass
