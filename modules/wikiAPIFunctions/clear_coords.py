import pandas
from numpy import NaN, nan, NAN
from change_path import *


FILE_TO = '%s_clear'


def clear_coords(file, file_to=None, strict=True):
    """ Clears all rows, that do not have coordinates """
    file_to = file_to or (FILE_TO % (file.replace('.csv', '')) + '.csv')

    if not isinstance(file, str):
        raise ValueError('%s - file name should be a string' % file)
    if not isinstance(file_to, str):
        raise ValueError('%s - file name should be a string' % file_to)

    to_files()

    df = pandas.read_csv(file, sep='\t')
    if strict:
        df = df[~df['long'].isnull()]
    else:
        df = df[~df['coordinates'].isnull()]

    with open(file_to, 'w', encoding='utf-8') as file:
        df.to_csv(file, index=False, header=True, sep='\t')

    to_functions()
