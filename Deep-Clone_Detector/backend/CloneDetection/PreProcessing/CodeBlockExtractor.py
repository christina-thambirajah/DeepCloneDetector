# The python file implements the functionality which aid to extract all the code blocks, including
# method level and file level code blocks from the files in the database.
from CloneDetection import Config
from CloneDetection.PreProcessing import MethodExtractor
from firebase_admin import storage
import urllib

# Put your local file path 
bucket = storage.bucket()

 
def extractCodeBlocksFromFiles(files):
    # set includes method blocks from all the files
    allCodeBlocks = {}
    # Counter for number of Lines
    totalLines = 0
    # No of blocks at present
    counter = 0
    # loop for every file in the database
    for filePath in files:
        try:
            # read code from file in firebase
            code = []
            for line in urllib.request.urlopen(filePath):
                totalLines = totalLines + 1
                codeLine = line.decode('utf-8')
                code.append(codeLine)
        except:
            continue
       
        # empty file consideration
        if len(code) == 0:
            continue
        # the app can suuport method level or code level blocks
        # must be defined in the config file
        if Config.granularity == 1:
            codeBlocks = methodLevelBlocks(code)
        else:
            codeBlocks = fileLevelBlocks(code)
        # file has no code blocks
        if len(codeBlocks) == 0:
            continue
        # add each code clock identifies to the totalCode blocks set for detection
        for codeBlock in codeBlocks:
            if len(codeBlock) == 0:
                continue
            codeBlock.update({"FileInfo": filePath.replace("%5C","/")})
            codeBlock.update({"FileName": filePath.replace("%5C","/").split("Uploaded", 2)[-1]})
            counter += 1
            allCodeBlocks["CodeBlock" + str(counter)] = codeBlock
    return allCodeBlocks,totalLines

# method takes in the code and returns the file level code blocks
def fileLevelBlocks(code):
    allCodeBlocks = []
    commentFreeCode = removeComments(code)
    startLine = 1
    endLine = len(commentFreeCode)
    # creates an array of objects with the entire code in the file
    allCodeBlocks.append(
        {"Start": startLine, "End": endLine, "Code": commentFreeCode})
    return allCodeBlocks

# method takes in the code and returns the method level code blocks
def methodLevelBlocks(code):
    commentFreeCode = removeComments(code)
    # code without whitespace
    spaceFreeCode = "\n".join(commentFreeCode)

    #extracts all the methods
    methods = MethodExtractor.method_extractor(spaceFreeCode)
    allCodeBlocks = []
    if methods[0] == None:
        return allCodeBlocks
    # iterate each method extracted and add it to the array of objects
    for i in range(len(methods[0])):
        if abs(methods[0][i][1] - methods[0][i][0]) < Config.minimumLengthBlock - 1:
            continue
        allCodeBlocks.append(
            {"Start": methods[0][i][0], "End": methods[0][i][1], "Code": methods[1][i]})

    return allCodeBlocks

# method takes in code and returns the code after removing all the comments
# necessary to detect type 2 clones
def removeComments(code):

    DEFAULT = 1
    ESCAPE = 2
    STRING = 3
    ONE_LINE_COMMENT = 4
    MULTI_LINE_COMMENT = 5

    mode = DEFAULT
    commentFreeCode = []
    # iterate every line of code
    for line in code:
        commentFreeLine = ""
        idx = 0
        # consider  all possible methods in which comments can be added and remove them from the code
        while idx < len(line):
            subString = line[idx: min(idx + 2, len(line))]
            c = line[idx]
            if mode == DEFAULT:
                mode = MULTI_LINE_COMMENT if subString == "/*" else ONE_LINE_COMMENT if subString == "//" else STRING if c == '\"' else DEFAULT
            elif mode == STRING:
                mode = DEFAULT if c == '\"' else ESCAPE if c == '\\' else STRING
            elif mode == ESCAPE:
                mode = STRING
            elif mode == ONE_LINE_COMMENT:
                mode = DEFAULT if c == '\n' else ONE_LINE_COMMENT
                idx += 1
                continue
            elif mode == MULTI_LINE_COMMENT:
                mode = DEFAULT if subString == "*/" else MULTI_LINE_COMMENT
                idx += 2 if mode == DEFAULT else 1
                continue
            commentFreeLine += c if mode < 4 else ""
            idx += 1
        if len(commentFreeLine) > 0 and commentFreeLine[-1] == '\n':
            commentFreeLine = commentFreeLine[:-1]
        commentFreeCode.append(commentFreeLine)
    return commentFreeCode


def trainingCodeFormatter(code):
    commentFreeCode = removeComments(code)
    # code without whitespace
    spaceFreeCode = "\n".join(commentFreeCode)

    return spaceFreeCode