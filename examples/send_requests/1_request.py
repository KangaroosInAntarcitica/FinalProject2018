import sys
sys.path.insert(0, '..\\..\\modules')

import wikiAPI

"""
This the first example of sending requests. It is recommended to take all the
examples from start for better understanding.

We will now send a props query.

We will first specify the required parameters for our query: that is we want
to get all the revisions for a page, each containing information about its
author - user and date - timestamp.

Then we need to define what data we want to get from our response, as we don't
want to spend extra storage on useless data.
We do that in the response_table, revisions attribute: all the data we need and
the datatype it needs to represented with

We then create a request object - it sends requests
and a response object - it takes data from response and stores it

NOTE: on_response param can be Response obj (one containing update method)
or a normal function (all the data will be given as parameter)
NOTE: you could replace on_response param with print function to understand
what exactly is going on in the response
"""

params = {
    'prop': 'revisions', 'rvprop': 'user|timestamp', 'rvlimit': 'max',
    'titles': 'Wardersee'
}

response_table = {
    'revisions': { 'pageid': 'int64', 'user': str, 'timestamp': object,
                  'anon': 'bool' }
}

# create a response handler - Object with update function
response = wikiAPI.WikiResponse(response_table)

# create a request with all the parameters, send it and show the results
request = wikiAPI.WikiRequest(params, on_response=response)
request.send_all()
print(response.show())
