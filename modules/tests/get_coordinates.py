import sys
sys.path.insert(0, '..\\')

import wikiAPI
import unittest


class CoordinatesTest(unittest.TestCase):
    def test_errors(self):
        data = {}
        self.assertFalse(wikiAPI.get_coordinates(data))

        data = {'content': 'bla bla bla bla. {{Coor|121.5|12|title=Name}}'}
        self.assertFalse(wikiAPI.get_coordinates(data))

        data = {'content': 'bla bla bla bla. {{Coord unknown}}'}
        self.assertFalse(wikiAPI.get_coordinates(data))

    def test_2params(self):
        data = {'content':
                'bla bla bla bla. {{Coord|121.5|12|title=Name}} some more text'
                'he what is this {{ bla }} {{}} and finally hello.'
        }
        parsed = wikiAPI.get_coordinates(data)

        self.assertEqual(parsed, '|121.5|12|title=name')
        self.assertEqual(wikiAPI.parse_coordinates(parsed), (121.5, 12))

    def test_4params(self):
        data = {'content':
                'bla bla bla bla. {{Coord|121|N|12|W|title=Name|region=}}'
        }
        parsed = wikiAPI.get_coordinates(data)

        self.assertEqual(parsed, '|121|n|12|w|title=name|region=')
        self.assertEqual(wikiAPI.parse_coordinates(parsed), (121, -12))

    def test_6params(self):
        data = {'content':
                'bla bla bla bla. {{Coord|121|30|S|12|15|W|title=Name|region=}}'
        }
        parsed = wikiAPI.get_coordinates(data)

        self.assertEqual(parsed, '|121|30|s|12|15|w|title=name|region=')
        self.assertEqual(wikiAPI.parse_coordinates(parsed), (-121.5, -12.25))

    def test_8params(self):
        data = {'content':
                'bla {{Coord|121|30|30|N|12|15|0|W|title=Name|region=}}'
        }
        parsed = wikiAPI.get_coordinates(data)

        self.assertEqual(parsed, '|121|30|30|n|12|15|0|w|title=name|region=')
        self.assertAlmostEqual(wikiAPI.parse_coordinates(parsed)[0], 121.508, 3)

    def test_real(self):
        data = {'content': '{{coord|49|49|48|N|24|0|51|E|scale:100000|display='
                           'inline,title}}'}
        parsed = wikiAPI.get_coordinates_data(data)
        self.assertEqual(parsed[1], 49.83)


if __name__ == '__main__':
    unittest.main()
