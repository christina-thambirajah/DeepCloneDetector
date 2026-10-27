# python file including functionality to save the detected clones in a file
from CloneDetection import Config
import csv

# writes the output to a text file
def writeToFile(codeBlocks):
    mode = 'w'
    with open(Config.outputPath, mode) as file:
        for codeBlockId in codeBlocks:
            codeBlock = codeBlocks[codeBlockId]
            if len(codeBlock["CodeClones"]) == 0:
                continue
            writeToFile = ""
            writeToFile += "Block id : " + codeBlockId
            writeToFile += "\nFile path : " + codeBlock["FileInfo"]
            writeToFile += "\nStart : " + str(codeBlock["Start"]) + " End : " + str(codeBlock["End"])
            tokensList = "\nTokensList : "

            for tokenVar in codeBlock["Tokens"]:
                tokensList += tokenVar + ":" + str(codeBlock["Tokens"][tokenVar]) + ","


            writeToFile += tokensList + "\n"
            # writeToFile += variablesList + "\n"
            # writeToFile += methodList + "\n"
            if Config.outputLevel < 2:
                writeToFile += "\nCode : \n"+ "\n".join(codeBlock["Code"])
            writeToFile += "\n" + "="*150 + "\n"
            writeToFile += "\nCodeClones : \n"
            for codeCloneBlockData in codeBlock["CodeClones"]:
                codeCloneBlockId = codeCloneBlockData["codeCandidateId"]
                codeCloneBlock = codeBlocks[codeCloneBlockId]
                codeCloneSimilarity = codeCloneBlockData["Similarity"]
                writeToFile += "Block id : " + codeCloneBlockId
                writeToFile += "\nSimilarity Tokens : " + str(codeCloneSimilarity[0])
                writeToFile += "\nSimilarity Variable Flow : " + str(codeCloneSimilarity[1])
                writeToFile += "\nSimilarity Methods Call Flow : " + str(codeCloneSimilarity[2])

                writeToFile += "\nFile path : " + codeCloneBlock["FileInfo"]
                writeToFile += "\nStart : " + str(codeCloneBlock["Start"]) + " End : " + str(codeCloneBlock["End"])
                if Config.outputLevel < 1:
                    writeToFile += "\nCode : \n"+ "\n".join(codeCloneBlock["Code"])
                writeToFile += "\n" + "-"*150 + "\n"
            writeToFile += "\n" + "#"*150 + "\n\n"
            file.write(writeToFile)
        file.close()

# writes the output to a CSV file
def writeToCSV(codeBlocks):
    mode = 'w'
    with open(Config.outputCSVPath, mode, newline='') as file:
        csv_writer = csv.writer(file)

        for codeBlockId in codeBlocks:
            codeBlock = codeBlocks[codeBlockId]
            if len(codeBlock["CodeClones"]) == 0:
                continue
            currCodeBlockFileName = codeBlock["FileInfo"].split("\\")[-1]
            currCodeBlockStart = str(codeBlock["Start"])
            currCodeBlockEnd = str(codeBlock["End"])
            for codeCloneBlockData in codeBlock["CodeClones"]:
                codeCloneBlockId = codeCloneBlockData["codeCandidateId"]
                codeCloneBlock = codeBlocks[codeCloneBlockId]
                codeCloneBlockFileName = codeCloneBlock["FileInfo"].split("\\")[-1]
                codeCloneBlockStart = str(codeCloneBlock["Start"])
                codeCloneBlockEnd = str(codeCloneBlock["End"])
                #CodeCloneSimilarity = codeCloneBlockData["Similarity"]

                if Config.granularity == 0:
                    csv_writer.writerow([currCodeBlockFileName, codeCloneBlockFileName])
                else:
                    csv_writer.writerow([currCodeBlockFileName, currCodeBlockStart, currCodeBlockEnd, codeCloneBlockFileName, codeCloneBlockStart, codeCloneBlockEnd])

        file.close()