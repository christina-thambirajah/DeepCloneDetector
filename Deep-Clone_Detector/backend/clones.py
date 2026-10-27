# The python file implements the functionality which aid to extract all the code blocks, including
# method level and file level code blocks from the files in the database.
from flask import Flask
from os import path
import firebase_admin
from flask import request
from flask import jsonify
from firebase_admin import credentials
from firebase_admin import firestore,initialize_app
from firebase_admin import storage
import urllib.request

# Initialize Firestore DB
cred = credentials.Certificate('key.json')
default_app = initialize_app(cred,{'storageBucket': 'deep-clone-detector.appspot.com'})

# Put your local file path 
bucket = storage.bucket()
 
def extractCodeBlocksFromFiles():
    code = []
    target_url ="https://storage.googleapis.com/deep-clone-detector.appspot.com/Deep-Clone_Detector/Source_Code/Upload%20Test%203/%5CStorage%5Ctravis-ci-tutorial-java-master%5Ctravis-ci-tutorial-java-master%5Csrc%5Cmain%5Cjava%5Cio%5Cgithub%5Cjoaomlneto%5Ctravis_ci_tutorial_java%5CSimpleCalculator.java"
    for line in urllib.request.urlopen(target_url):
        codeLine = line.decode('utf-8')
        code.append(codeLine)
    print(code)
   
        
extractCodeBlocksFromFiles()
        