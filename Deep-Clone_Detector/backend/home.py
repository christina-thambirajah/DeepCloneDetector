from flask import Blueprint

home = Blueprint('home', __name__)


@home.route('/', methods=['GET'])
def working():
    return '''<h1>Deep-Clone Detector API</h1>
<p>An api created for the backend of the Deep Learning based Code Clone Detector.</p>'''