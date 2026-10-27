# python file containing functionality to detect clone from all code blocks extracted
import pickle
from keras.preprocessing.text import one_hot
import numpy as np
from tensorflow import keras
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'


basedir = os.path.abspath(os.path.dirname(__file__))
 
currentID = ""
currentStatus = ""
sourceCode_ref = ""


def detectClone(codeBlocks):
    codeArray = []
    statistics = {}
    suggestions = []
    statistics['totalCodeBlocks'] = len(codeBlocks)
    
    for codeBlockId in codeBlocks:
        codeBlock = codeBlocks[codeBlockId]
        code = codeBlock['Code']
    # create an array containing all the code blocks
        codeArray.append(code)
    # tokenize the array of code blocks
    global currentStatus 
    currentStatus = "Tokenizing Code Blocks"
    updateStatus()
    tokenizedCode = Tokenization(codeArray)
    # perform feature extraction on the code blocks
    currentStatus = "Performing Feature Extraction"
    updateStatus()
    encodedCode = FeatureExtraction(tokenizedCode)

    count = 0
    for codeBlockId in codeBlocks:
        codeBlock = codeBlocks[codeBlockId]
        codeBlock.update({"encoding": encodedCode[count]})
        count=count+1

    pairedCodeBlocks = []
    pairedLatentCode = []
    syntaxClones = []
    currentStatus = "Paring Up Code Blocks"
    updateStatus()
    # pair up this code block
    for codeBlockId in codeBlocks:
        for codeBlockCompareID in codeBlocks:
            codeBlock = codeBlocks[codeBlockId]
            codeBlockCompare = codeBlocks[codeBlockCompareID]
            if codeBlockCompareID != codeBlockId:
                pairedLatentCode.append([codeBlock['encoding'],codeBlockCompare['encoding']])
                pairedCodeBlocks.append([codeBlockId,codeBlockCompareID])
                if(set(codeBlock['encoding']) == set(codeBlockCompare['encoding'])):
                    if {"1":codeBlockCompareID,"2": codeBlockId} not in syntaxClones:
                        syntaxClones.append({"1":codeBlockId,"2":codeBlockCompareID})
                        
    suggestions = createSuggestions(syntaxClones)
                
                
    currentStatus = "Performing Classification"
    updateStatus()
    
    #pass to classifier
    results = Classification(pairedLatentCode)
    #save the id of possitive matches in an array codeCloneIds
    count = 0
    clonesArray = []
    while count < len(pairedCodeBlocks):
        codeBlockId_first = pairedCodeBlocks[count][0]
        codeBlockId_second = pairedCodeBlocks[count][1]
        codeBlock = codeBlocks[codeBlockId_first]
        #save array to the object
        if (results[count] == 1.0):
            #means pair is a clone
            if 'CodeClones' in codeBlock:
                array = []
                for item in codeBlock['CodeClones']:
                    array.append(item)
                array.append(codeBlockId_second)
                codeBlock.update({"CodeClones": array})
            else:
                codeBlock.update({"CodeClones": [codeBlockId_second]})
        count = count+1
    
    currentStatus = "Performing Clone Analysis"
    updateStatus()
    blocksWithClones = 0
    cloneGroups = {}
    cloneGroupCounter = 1
    for codeBlockId in codeBlocks:
        codeBlock = codeBlocks[codeBlockId]
        codeBlock['encoding'] = str(codeBlock['encoding'])
        if 'CodeClones' in codeBlock:
            tempArray = []
            tempArray.append(codeBlockId)
            tempArray.extend(codeBlock['CodeClones'])
            cloneGroups['Group' + str(cloneGroupCounter)] = tempArray
            cloneGroupCounter = cloneGroupCounter + 1
            blocksWithClones = blocksWithClones + 1
            
        
    statistics['clonePercentage'] = round((blocksWithClones /len(codeBlocks))*100,2)
    statistics['cloneGroups'] = cloneGroups
    statistics['syntaxClones'] = syntaxClones
    
    currentStatus = "Completing Clone Detection"
    updateStatus()
    return codeBlocks, statistics, suggestions


def Tokenization(code_array):
    database = getDatabase(code_array)
    tokenized_code_array = runTokenizer(database)
    tokenized_formatted = addZeros(tokenized_code_array)

    # alert the completion of tokenization processes.
    print("Tokenization process complete.")
    return tokenized_formatted

def FeatureExtraction(tokenized_code_array):
    
    data_arr = np.array(tokenized_code_array, dtype=np.float32)
    savedAutoencoder = keras.models.load_model(basedir+'\\'+'SavedModel_AAE_Encoder')

    result = savedAutoencoder.predict(data_arr)
    print("Feature Extraction process complete.")
    return result


def Classification(paired_latent_code):
    filename = basedir+'\\'+'AE_Model'
    
    arrayPairedList  =  np.array(paired_latent_code)
    nsamples, nx, ny = arrayPairedList.shape
    d2_train_dataset = arrayPairedList.reshape((nsamples, nx * ny))
    
    loaded_model = keras.models.load_model(filename)
    result_temp = loaded_model.predict(d2_train_dataset)
    result = [1.0 if e > 0.50 else 0.0 for e in result_temp]
    
    print("Classification process complete.")
    return result

def TokenizeKeras(textList):
    filename = basedir+'\\'+"Tokenizer.sav"
    with open(filename, 'rb') as pickle_file:
        tf_keras_tokenizer,tf_keras_encoded = pickle.load(pickle_file)
    tf_keras_encoded = tf_keras_tokenizer.texts_to_sequences([textList])
    return tf_keras_encoded[0]


def runTokenizer(entireDatabase):
    # text tokenizer from keras
    result = TokenizeKeras(entireDatabase)

    trainingData = []
    tempArray = []
    newfunctionToken = result[0]
    del result[0]
    maxLengthArray = [];
    for token in result:
        if token == newfunctionToken:
            trainingData.append(tempArray)
            maxLengthArray.append(len(tempArray))
            tempArray = []
        else:
            tempArray.append(token)

    print("Converting to tokens..")
    return trainingData


def getDatabase(code_array):
    # compiling all methods to as one unit for tokenization
    entireDatabase = " NextFunction "

    # number of blocks processed
    number = 0

    for code in code_array:
        number = number + 1
        print("\t\tProcessing codeblock " + str(number))
        entireDatabase = entireDatabase + code + " NextFunction "

    return entireDatabase

def addZeros(data):
    finalArrayData = []
    max=1000
    print("Adding zeros to standardize the size of the token matirces..")
    for function in data:
        currentArray = np.array(function)
        finalArrayData.append(np.pad(function, (0, (max - len(currentArray))), 'constant'))

    return finalArrayData

def createSuggestions(syntaxClones):
    suggestions = [];
    
    syntaxSuggestion = "This is a syntax clone, so the clone can be removed and referenced by ObjectInstance.methodname"
    
    for sClone in syntaxClones:
        suggestions.append({"suggestion":syntaxSuggestion,"codeBlock":sClone['1'],"clone":sClone['2']})
        
    return suggestions


def updateStatus():
    statusObject = {}
    statusObject['id']= currentID
    statusObject['status'] = currentStatus
    sourceCode_ref.document(currentID).set(statusObject)
    print("Status set to "+ currentStatus)
    
    



