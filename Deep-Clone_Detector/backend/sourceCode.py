import flask
from flask import request, jsonify
from flask import Blueprint
from firebase_admin import firestore
from firebase_admin import credentials, initialize_app, storage
import os
from os import walk
from os import path 
import classifier
import zipfile 
import shutil
import threading
import time
from CloneDetection.ClassificationModel import ClassifyClones
from CloneDetection.ClassificationModel.ClassifyClones import updateStatus
# Put your local file path 
bucket = storage.bucket()


db = firestore.client()
sourceCode_ref = db.collection('source_code')
source_code = Blueprint('source_code', __name__)


basedir = os.path.abspath(os.path.dirname(__file__))


@source_code.route('/api/v1/resources/source_code', methods=['GET'])
def fetchOne():
    if 'id' in request.args:
            id = int(request.args['id'])
    else:
        return "Error: No id field provided. Please specify an id."
    
    try:
        results = sourceCode_ref.stream()
        array = []
        for doc in results:
            print(doc.id)
            print(id)
            if str(doc.id)==str(id):
                array.append(doc.to_dict())
        return jsonify(array), 200
    except Exception as e:
        return f"An Error Occured: {e}"
    
@source_code.route('/api/v1/resources/source_code', methods=['DELETE'])
def delete():
    if 'id' in request.args:
            id = int(request.args['id'])
    else:
        return "Error: No id field provided. Please specify an id."
    
    try:
        results = sourceCode_ref.stream()
        for doc in results:
            if str(doc.id)==str(id):
                doc.reference.delete()
        return jsonify({"success": True}), 200
    except Exception as e:
        return f"An Error Occured: {e}"

@source_code.route('/api/v1/resources/source_code/all', methods=['GET'])
def fetchAll():
    
    try:
        results = sourceCode_ref.stream()
        array = []
        for doc in results:
            array.append(doc.to_dict())
        newlist = sorted(array, key=lambda d: int(d['id'])) 
        return jsonify(newlist), 200
    except Exception as e:
        return f"An Error Occured: {e}"

@source_code.route('/api/v1/resources/source_code/add', methods=['POST'])
def create():
     
    results = sourceCode_ref.stream()
    array = []
    for doc in results:
        array.append(doc.to_dict())
    newlist = sorted(array, key=lambda d: int(d['id'])) 
    if len(newlist) > 0:
        newID = int(newlist[-1]['id']) + 1
    else:
        newID = 1
    
    if 'name' not in request.args:
        return "Error: No name field provided. Please specify an name."
    
    try:
        id = str(newID)
        name =  request.args['name']
        file = request.files.to_dict()
        try:
            blob = bucket.blob('Deep-Clone_Detector/Source_Code/'+name+'/'+name+'.zip')
            blob.upload_from_file(file['file'])
            blob.make_public()
            ZipFileRef = bucket.blob('Deep-Clone_Detector/Source_Code/'+name+'/'+name+'.zip')
            pathOfFolder = ZipFileRef.public_url
        except: 
            print("Upload zip to storage failed")
        ClassifyClones.currentID = id
        ClassifyClones.currentStatus = "Fetching Files"
        ClassifyClones.sourceCode_ref = sourceCode_ref
        updateStatus()
        filesFound = fetchFilesFromDatabase(file['file'])
        if len(filesFound) < 1:
            raise Exception("No Java files found")
        savedFiles = []
        for pathOfFile in filesFound:
            blob = bucket.blob('Deep-Clone_Detector/Source_Code/'+name+'/'+pathOfFile.replace('.\\',"\\"))
            blob.upload_from_filename(pathOfFile)
            blob.make_public()
            savedFiles.append(blob.public_url)
        
            
        folderRef = bucket.blob('Deep-Clone_Detector/Source_Code/'+name)
        newObject = request.args.to_dict()
        newObject['folder'] = folderRef.public_url
        newObject['id'] = id
        
        #start processing
        print("Started processing")
        try:
            code_blocks,statistics,suggestions = classifier.initateClassifier(savedFiles)
        except:
            raise Exception("No Code Blocks found")
        
        ClassifyClones.currentStatus = "Finishing Process"
        updateStatus()
        
        print("Finished processing")
        #write code blocks to db
        newObject['codeBlocks'] = code_blocks
        #write statistics to db
        newObject['statistics'] = statistics
        #write suggestions to db
        newObject['suggestions'] = suggestions
        
        ClassifyClones.currentStatus = "Removing Temporary Files"
        updateStatus()
        
        try:
            #remove temporary files
            print("remove temp files")
            files = basedir + "/Uploaded"
            shutil.rmtree(files)
            if not os.path.exists(files):
                os.makedirs(files)
        except:
            print("Uploaded file was not deleted")
            
        ClassifyClones.currentStatus = "Completed"
        updateStatus()
        
        newObject['status'] = "Completed"
            
        #write to firebase
        sourceCode_ref.document(id).set(newObject)
        
       
        
        return jsonify({"success": True}), 200
    except Exception as e:
        try:
            #remove temporary files
            print("remove temp files")
            files = basedir + "/Uploaded"
            shutil.rmtree(files)
            if not os.path.exists(files):
                os.makedirs(files)
        except:
            print("Uploaded file was not deleted")
            
        results = sourceCode_ref.stream()
        for doc in results:
            if str(doc.id)==str(newID):
                doc.reference.delete()
        return f"An Error Occured: {e}"




def fetchFilesFromDatabase(path):
    
    with zipfile.ZipFile(path,"r") as zip_ref:
        zip_ref.extractall(basedir + "/Uploaded")
        
    #access database from path provided in cofig
    database = basedir + "/Uploaded"
    # array to contain all the files in the folder
    allFiles = []
    #check if the path provided is correct
    if os.path.exists(database):
        # listdir() returns a list containing the names of the entries in the directory given by path
        filePaths = []
        for dirpath, dirnames, filenames in os.walk("."):
            string = 'Uploaded'
            if(string in dirpath):
                for filename in [f for f in filenames if f.endswith(".java")]:
                    filePaths.append(os.path.join(dirpath, filename))
    
    
    return filePaths



        
