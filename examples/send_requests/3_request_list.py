import sys
sys.path.insert(0, '..\\..\\modules')

import wikiAPI

'''
In the previous examples we used the props to get our information from API
Now we will use the the list - it is used for slightly different queries
and returns a different value (which you shouldn't bother about)

We will use the same wikiAPI.WikiResponse object here

We will send a request to get allpages of Wikipedia.
The information we need is specified in the response table - pageid, title, ns

Now we could have just used the send_all() function to get the request and it
will start sending multiple requests until done.
However, all the wikipedia pages take a lot of space and a lot of time to send,
so we will just send our request 10 times instead.
For this we use the send() function

Note: request.resume parameter tells whether all the responses required were
sent or not (whether we can continue asking for data)
The send_all just calls the send() function while request.resume is True

If you call the request.send() function when the request.resume is False, it
will just repeat the last request (which might sometimes cause errors in 
response, but should mostly work just fine)
'''

params = {
    'list': 'allpages',
    'aplimit': 'max'
}

response_table = {
    'allpages': {
        'pageid': 'int64',
        'ns': 'int64',
        'title': str
    }
}

response = wikiAPI.WikiResponse(response_table)

request = wikiAPI.WikiRequest(params, on_response=response)
for i in range(10):
    request.send()

print(response.show())
