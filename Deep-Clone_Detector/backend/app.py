from flask import Flask
import firebase_admin
from flask import request
from flask import jsonify
from firebase_admin import credentials
from firebase_admin import firestore,initialize_app
from flask_cors import CORS
import os

app = Flask(__name__)
port = os.environ.get("PORT", 8080)

def create_app():
    
    CORS(app)

    from sourceCode import source_code
    from home import home

    app.register_blueprint(home, url_prefix='/')
    app.register_blueprint(source_code, url_prefix='/')

    
    return app


if __name__ == 'app':
    # Initialize Firestore DB
    cred = credentials.Certificate('key.json')
    default_app = initialize_app(cred,{'storageBucket': 'deep-clone-detector.appspot.com'})
    
    
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=int(port))






