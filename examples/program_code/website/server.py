from flask import Flask, render_template, request
from os import path
from convert import convert

app = Flask(__name__, template_folder='', static_url_path='/wiki')


@app.route('/')
def index():
    return render_template('topographic.html')


@app.route('/file/<name>')
def get_data(name):
    current = path.relpath(name)
    parent = path.relpath('..\\%s' % name)

    if path.isfile(current):
        return open(current, 'r', encoding='utf-8').read()
    elif path.isfile(parent):
        return ''.join(open(parent, 'r', encoding='utf-8').readlines()[:])
    elif path.isfile(current.replace('json', 'csv')):
        return convert(current)
    elif path.isfile(parent.replace('json', 'csv')):
        return convert(parent)

app.run(debug=1, port=5000)
