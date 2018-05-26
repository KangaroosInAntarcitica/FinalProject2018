from flask import Flask, render_template, request
import os
import subprocess
import json

from convert import convert
from file_check import get_all_files


FILES_ROUTE = '..\\wikiAPIFiles\\'
TEMPLATE_FOLDER = 'website_content\\'

app = Flask(__name__, template_folder=TEMPLATE_FOLDER, static_url_path='/wiki')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/docs')
def get_docs():
    return get_data('docs.html')


@app.route('/file/<name>')
def get_data(name):
    """
    Retrieve files
    Directories searched: parent, website_content
    """
    current = os.path.relpath('.\\website_content\\%s' % name)
    parent = os.path.relpath('%s%s' % (FILES_ROUTE, name))

    if os.path.isfile(current):
        return open(current, 'r', encoding='utf-8').read()
    elif os.path.isfile(parent):
        return open(parent, 'r', encoding='utf-8').read()

    elif os.path.isfile(current.replace('json', 'csv')):
        return convert(current)
    elif os.path.isfile(parent.replace('json', 'csv')):
        return convert(parent)


@app.route('/files/')
def files():
    return json.dumps(get_all_files())


@app.route('/map/')
@app.route('/map/<file_name>')
def get_map(file_name=None):
    return get_data('topographic_improved_design.html')


@app.route('/map/file/<name>')
def get_map_data(name):
    return get_data(name)


@app.route('/function/<command>')
def call_function(command):
    os.chdir('..\\wikiAPIFunctions')

    command = 'python exec_function.py ' + command
    subprocess.call('start %s' % command, shell=True)
    # os.system("gnome-terminal -e 'bash -c \" %s; sleep 1000000\" '" % command)
    os.chdir('..\\server')

    return 'true'


app.run(debug=1, port=5000)
