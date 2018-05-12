import sys
sys.path.insert(0, '..\\')

import wikiAPI
import unittest


class TestWikiRequest(unittest.TestCase):
    def test_attributes(self):
        request = wikiAPI.WikiRequest({})
        request.language = 'en'

        self.assertEqual(request.get_url(), 'http://en.wikipedia.org/w/api.php')
