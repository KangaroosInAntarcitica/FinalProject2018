from wikipedia import wiki_request, wiki_page, wiki_pages, wiki_languages

# test some of the module functionality
print(wiki_request({'list': 'allrevisions', 'arvdir': 'newer', 'arvlimit': 'max'}))
print(wiki_pages())
print(wiki_page(titles=['Microsoft']))
print(wiki_page(pageids=['19001'], get=['user', 'timestamp'], limit='max'))
