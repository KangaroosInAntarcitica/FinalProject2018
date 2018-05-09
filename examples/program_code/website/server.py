from flask import Flask, render_template, request
from os import path
from convert import convert
import json

app = Flask(__name__, template_folder='', static_url_path='/wiki')


@app.route('/')
def index():
    return get_data('topographic.html')


@app.route('/file/<name>')
def get_data(name):
    """
    Retrieve files
    Directories searched: parent, website_content
    """
    current = path.relpath('.\\website_content\\%s' % name)
    parent = path.relpath('..\\%s' % name)
    print(current)

    if path.isfile(current):
        return open(current, 'r', encoding='utf-8').read()
    elif path.isfile(parent):
        return open(parent, 'r', encoding='utf-8').read()

    elif path.isfile(current.replace('json', 'csv')):
        return convert(current)
    elif path.isfile(parent.replace('json', 'csv')):
        return convert(parent)

app.run(debug=1, port=5000)
