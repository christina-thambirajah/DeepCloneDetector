# File is the main python file that runs the entire application
# It fetches the files for CC, extracts the methods from the java files and initiates clone detection among the methods.
from CloneDetection.ClassificationModel import ClassifyClones
from CloneDetection.PreProcessing import CodeBlockExtractor
from CloneDetection.PostProcessing import CloneSave
import time
import tracemalloc
from CloneDetection.ClassificationModel.ClassifyClones import updateStatus



def initateClassifier(files):
    
    #tracemaloc is used to trace memory allocation for the process
    ClassifyClones.currentStatus = "Process Initiated"
    updateStatus()
    tracemalloc.start()
    #startime time is recorded to give the time taken for each task till completion.
    starting_time = time.process_time()

    #extracting the code blocks from the files
    print("Extracting the code blocks")
    ClassifyClones.currentStatus = "Extracting Code Blocks"
    updateStatus()
    code_blocks,totalLines = CodeBlockExtractor.extractCodeBlocksFromFiles(files)
    time_taken = (time.process_time() - starting_time)
    print("Total Code Blocks : ", len(code_blocks))
    print("Time taken to Extract Methods:", time_taken)

    #Initiate Clone Detection
    print("Detect clones")
    ClassifyClones.currentStatus = "Initiating Clone Detection"
    updateStatus()
    results,statistics,suggestions = ClassifyClones.detectClone(code_blocks)

    time_taken = (time.process_time() - starting_time)
    print("Time taken for Clone Detection:", time_taken)

    #Write results of detected clones to CSV file
    print("Writing clones to CSV file")
    # CloneSave.writeToCSV(results)
    # CloneSave.writeToFile(results)
    time_taken = (time.process_time() - starting_time)

    #Print details of process on completion
    print("Time for Completion:", time_taken)
    current, peak = tracemalloc.get_traced_memory()
    print(f"Total memory usage : {current / 10**6}MB; Peak was {peak / 10**6}MB")
    tracemalloc.stop()
    
    statistics['numberOfFiles'] = len(files)
    statistics['numberOfLines'] = totalLines
    
    ClassifyClones.currentStatus = "Updating Detected Information"
    updateStatus()
    
    return results, statistics, suggestions





    