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


def run(arguments):
    try:
        if len(arguments) > 0:
            print('Calling: %s(%s)' % (arguments[1], ', '.join(arguments[2:])))
            func = functions[arguments[1]]
            func(*arguments[2:])
    except Exception as error:
        print('Error: ', error)

    print('\n\nProcess finished')
    input('Close ---> ')


def run_directly(argument_str):
    run(argument_str.split()[1:])


if __name__ == '__main__':
    run(sys.argv)
