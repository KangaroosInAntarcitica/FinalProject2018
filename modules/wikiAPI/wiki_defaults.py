# some of the useful default variables for wikipedia.py are defined here

WIKI_URL = 'http://en.wikipedia.org/w/api.php'
USER_AGENT = 'BOT Wikipedia National Geography Proj' \
             '(https://github.com/KangaroosInAntarcitica/FinalProject2018' \
             '| Andriyd909@gmail.com)'

REQUEST_TIMEOUT = 10

default_parameters = {
    'action': 'query',
    'format': 'json',
    'formatversion': '2'
}

possible_params = {
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
    'formatversion': ('1', '2')
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