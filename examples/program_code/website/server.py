from flask import Flask, render_template, request
from os import path

app = Flask(__name__, template_folder='', static_url_path='/wiki')


@app.route('/')
def index():
    return render_template('azimuthal.html')


@app.route('/file/<name>')
def get_data(name):
    current = path.relpath(name)
    parent = path.relpath('..\\%s' % name)

    if path.isfile(current):
        return open(current, 'r', encoding='utf-8').read()
    elif path.isfile(parent):
        return open(parent, 'r', encoding='utf-8').read()


app.run(debug=1, port=5000)
