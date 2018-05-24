import sys

from combine_files import combine_files
from clear_coords import clear_coords

from get_all_pages_safe import get_all_pages
from get_page_coordinates_safe import get_page_coordinates
from get_revisisons import get_revisions
from get_langlinks import get_langlinks


def combine_files_bash(*args):
    combine_files(args)


functions = {
    'combine_files': combine_files_bash,
    'clear_coords': clear_coords,
    'get_all_pages': get_all_pages,
    'get_page_coordinates': get_page_coordinates,
    'get_revisions': get_revisions,
    'get_langlinks': get_langlinks
}


def run():
    try:
        if len(sys.argv) > 0:
            print('Calling: %s(%s)' % (sys.argv[1], ', '.join(sys.argv[2:])))
            func = functions[sys.argv[1]]
            func(*sys.argv[2:])
    except Exception as error:
        print(error)

    print('\n\nProcess finished sucessfully!')
    input('Close ---> ')


if __name__ == '__main__':
    run()
