"""
This module is used for creating a single .csv file from all the data
collected.
"""
import pandas
from change_path import *

FILE_TO = "%s_all_data.csv"


def combine_frames(frames, on=None):
    """
    Function combines 2 files
    """
    on = on or ['pageid', 'title', 'ns']

    if not len(frames) == 2 and \
            all(map(lambda x: isinstance(x, pandas.DataFrame), frames)):
        raise ValueError('Only 2 files allowed, each ')

    combined = pandas.merge(left=frames[0], right=frames[1], on=on)
    combined = combined.drop_duplicates()
    return combined


def combine_files(files, file_to=None, language=None):
    """
    Function combines all files, specified as a list of strings
    """
    language = language or files[0][:2]
    file_to = file_to or FILE_TO % language

    if not isinstance(language, str) or len(language) != 2:
        raise ValueError('Language should be a string of length 2')
    if not len(files) > 1:
        raise ValueError('At least 2 files are required')
    if not all(map(lambda x: isinstance(x, str), files)):
        raise ValueError('Files should be specified as strings')

    frames = []
    to_files()
    for file in files:
        df = pandas.read_csv(file, sep='\t')
        frames.append(df)

    combined = combine_frames(frames[:2])
    for frame in frames[2:]:
        combined = combine_frames([combined, frame])

    with open(file_to, 'w', encoding='utf-8') as file:
        combined.to_csv(file, index=False, header=True, sep='\t')

    to_functions()

