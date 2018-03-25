import sys
sys.path.insert(0, '..\\..\\modules')

import wikiAPI

'''
In this example we will send a prop query for multiple pages.

For this you just use a list, tuple or pandas.Series instead of string in the
titles (like this example) or pageids parameter.
The wikiAPI will send the requests for these one by one.

Note: the request max parameter specifies how many pages we want to get in a 
single response (maximal value is 50). Here it is set to 1 to show you the 
functionality of the function.
Note: you can not use both titles and pageids in the same query
'''

params = {
    'prop': 'revisions',
    'rvprop': 'user|timestamp',
    'titles': ['Microsoft', 'Apple', 'Berlin']
}

response_table = {
    'revisions': {
        'user': str,
        'timestamp': str
    }
}

response = wikiAPI.WikiResponse(response_table)
request = wikiAPI.WikiRequestMultiplePage(params, on_response=response, max=1)
request.send_all()

print(response.show())
