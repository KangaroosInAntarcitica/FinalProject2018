from flask import Flask, render_template, request, send_from_directory
import os
import subprocess
import json

from convert import convert
from file_check import get_all_files


FILES_ROUTE = '..\\wikiAPIFiles\\'
TEMPLATE_FOLDER = 'website_content\\'

app = Flask(__name__, template_folder=TEMPLATE_FOLDER,
            static_folder='website_static', static_url_path='/wiki')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/docs')
def get_docs():
    return render_template('docs.html')


@app.route('/file/<name>')
def get_data(name):
    """
    Retrieve files
    Directories searched: parent, website_content
    """
    if name.endswith('.css'):
        return send_from_directory('website_content', name)

    current_folder = '.\\website_content\\'
    parent_folder = FILES_ROUTE
    current = os.path.relpath('.\\website_content\\%s' % name)
    parent = os.path.relpath('%s%s' % (FILES_ROUTE, name))

    if os.path.isfile(current):
        return send_from_directory(current_folder, name)
    elif os.path.isfile(parent):
        return send_from_directory(parent_folder, name)

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
    return render_template('topographic_improved_design.html')


@app.route('/map/file/<name>')
def get_map_data(name):
    return get_data(name)


@app.route('/function/<command>')
def call_function(command):
    os.chdir('..\\wikiAPIFunctions')

    command = 'python exec_function.py ' + command
    try:
        subprocess.call('start %s' % command, shell=True)
    except:
        import exec_function
        exec_function.run_directly(command)
        # os.system("gnome-terminal -e 'bash -c \" %s; sleep 1000000\" '" % command)

    os.chdir('..\\server')
    return 'true'


app.run(debug=1, port=5000)
