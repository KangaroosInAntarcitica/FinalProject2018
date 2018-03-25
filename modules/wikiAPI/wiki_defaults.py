# some of the useful default variables for wikipedia.py are defined here

WIKI_URL = 'http://%s.wikipedia.org/w/api.php'
USER_AGENT = 'BOT Wikipedia National Geography Proj' \
             '(https://github.com/KangaroosInAntarcitica/FinalProject2018' \
             '| Andriyd909@gmail.com)'

TIMEOUT = 10

PARAMETERS = {
    'action': 'query',
    'format': 'json',
    'formatversion': '1'
}

all_params = {
    'action': ('query', 'edit', 'help'),
    'meta': ('allmessages', 'filerepoinfo', 'siteinfo', 'tokens', 'userinfo'),
    'prop': ('categories', 'categoryinfo', 'contributors', 'deletedrevisions',
             'duplicatefiles', 'extlinks', 'fileusage', 'imageinfo', 'images',
             'info', 'iwlinks', 'langlinks', 'links', 'linkshere', 'pageprops',
             'redirects', 'revisions', 'stashimgeinfo', 'templates',
             'transcludedin'),
    'list': ('allcategories', 'alldeletedrevisions', 'allfileusages',
             'allimages', 'alllinks', 'allpages', 'allredirects',
             'allrevisions', 'alltransclusions', 'allusers', 'backlinks',
             'blocks', 'categorymembers', 'deletedrevs', 'emgeddedin',
             'exturlusage', 'filearchive', 'imageusage', 'iwbacklinks',
             'langbacklinks', 'logevents', 'pagepropnames', 'pageswithprop',
             'prefixsearch', 'protectedtitles', 'querypage', 'random',
             'recentchanges', 'search', 'tags', 'usercontribs', 'users',
             'watchlist','watchlistraw'),
    'format': ('json'),
    # 'jsonfm', 'none', 'php', 'xml', 'wddx', 'dump', 'txt', 'dbg', 'yaml'
    'formatversion': ('1', '2'),
    'callback': (),
    'utf-8': ('')
}

short_form = {
    'categories': 'cl',
    'categoryinfo': 'ci',
    'contributors': 'pc',
    'deletedrevisions': 'drv',
    'revisions': 'rv',
    'langlinks': 'll',
    'backlinks': 'bl',
    'allpages': 'ap',
    'allrevisions': 'arv',
}

RESPONSE = {
    'pages': {'pageid': 'int64', 'ns': 'int64', 'title': str}
}
