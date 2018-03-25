import sys
sys.path.insert(0, '..\\..\\modules')

import wikiAPI

'''
When retrieving large amounts of data, the chance of getting an error in 
Wikipedia, connection error is quite high. Also, the functionality to stop
sending requests and then continue this session the next morning may be
useful when parsing huge amounts of pages.

This is exactly what WikiSafeRequest does. Note, that it doesn't save all your
data automatically. It is essential to specify the file path in the response, 
so that no information is lost.

To test the functionality you will need to call this .py file a few times
You'll see that all the data is saved and every time more data is retreived,
even though program closes.

Note that all the data of request is saved in 'temp.txt' by default.
If similar requests are sent, the data representing the first may replace
the second. If you need to store request data for a long time, you may
specify another temporary file for it, using the state_file parameter.
Also note, that file can be deleted after the entire request is done and it
is not deleted automatically by the program.
'''

# IMPORTANT! THE save_every should be the same for Response and Request
save_every = 1

params = {
    'list': 'allcategories',
    'aclimit': '20'
}

response_table = {
    'allcategories': {
        '*': str
    }
}

response = wikiAPI.WikiResponse(
    response_table,
    file='all_categories.csv',
    save_every=save_every
)
request = wikiAPI.WikiSafeRequest(
    params,
    on_response=response,
    save_every=save_every
)
request.send()

print(response.show())
