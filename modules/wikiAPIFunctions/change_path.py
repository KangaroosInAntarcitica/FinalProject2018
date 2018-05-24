import os

"""
Module was created for manipulation between all the files of the project
"""

FILES_DIR = '..\\wikiAPIFiles'
FUNCTIONS_DIR = '..\\wikiAPIFunctions'
SERVER_DIR = '..\\server'


def to_files():
    os.chdir(FILES_DIR)


def to_functions():
    os.chdir(FUNCTIONS_DIR)


def to_server():
    os.chdir(SERVER_DIR)
