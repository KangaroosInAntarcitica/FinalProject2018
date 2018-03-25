import sys
sys.path.insert(0, '..\\..\\modules')

import wikiAPI
import datetime

"""
This example is slightly different from the previous one.
In the previous table, our timestamp was a string. However, that is not really
efficient and it's much better to represent it with a datetime object

We will add a function to convert date to normal. But, as our response doesn't
know what exactly we want to do, our function is given 2 parameters - 
information about the entire revision and information about the page.
We will get the 'timestamp' from revision object and return the date after
creating a datetime object

Note how in custom the key is the name of our table column (but the column
should still be created in the response_table) and the value is the function.
The key may also be a tuple of table column names - then the function needs to
return a tuple or list of values for each of them. This might be used to make
the program faster and not to parse the same information twice.
"""


def to_date(revision, page):
    return datetime.datetime.strptime(revision['timestamp'], "%Y-%m-%dT%H:%M:%SZ")


params = {
    'prop': 'revisions', 'rvprop': 'user|timestamp', 'rvlimit': 'max',
    'titles': 'Wardersee'
}

response_table = {
    'revisions': { 'pageid': 'int64', 'user': str, 'timestamp': object,
                  'anon': 'bool' }
}

custom = {
    'revisions': {
        'timestamp': to_date
    }
}

# create a response handler - Object with update function
response = wikiAPI.WikiResponse(response_table, custom=custom)

# create a request with all the parameters, send it and show the results
request = wikiAPI.WikiRequest(params, on_response=response)
request.send_all()
print(response.show())
