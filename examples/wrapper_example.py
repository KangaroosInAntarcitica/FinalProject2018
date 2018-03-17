import sys
sys.path.insert(0, r'..\modules')
print(sys.path)

'''
This example uses an old version of the wikiAPI, that lacks a lot of
functionality and will be replaced with new soon.
'''

from wikiAPI import wiki_request, wiki_page, wiki_pages, wiki_languages

# test some of the module functionality
print(wiki_request({'list': 'allrevisions', 'arvdir': 'newer', 'arvlimit': 'max'}))
print(wiki_pages())
print(wiki_page(titles=['Microsoft']))
print(wiki_page(pageids=['19001'], get=['user', 'timestamp'], limit='max'))
