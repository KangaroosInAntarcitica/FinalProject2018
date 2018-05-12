"""
This module is used for creating a single .csv file from all the data
collected.
"""
import pandas

FILE_TO = "%s_all_data.csv"
LANGUAGE = 'uk'


def combine_files(language=None, file_to=None):
    # TODO write more checks for function
    if language is None:
        language = LANGUAGE
    if file_to is None:
        file_to = "%s_all_data.csv" % language

    coordinates = pandas.read_csv('uk_all_page_coords_clear.csv', sep='\t')
    revisions = pandas.read_csv('uk_older_revisions.csv', sep='\t')
    combined = pandas.merge(left=coordinates,
                            right=revisions,
                            on=['pageid', 'title', 'ns'])
    combined = combined.drop_duplicates()

    with open(file_to, 'w', encoding='utf-8') as file:
        combined.to_csv(file, index=False, header=True, sep='\t')


if __name__ == '__main__':
    combine_files()
