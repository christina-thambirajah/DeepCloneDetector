import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SourceCodeModel, StatisticModel } from 'src/app/services/Models/sourceCodeModel';
import { UploadService } from 'src/app/services/upload.service';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { CodeCompareComponent } from '../code_compare/code_compare.component';



@Component({
    selector: 'clones-cmp',
    moduleId: module.id,
    templateUrl: 'clones.component.html'
})

export class ClonesComponent implements OnInit {
    public projects: SourceCodeModel[];
    public currentProjectID: string = "";
    public currentProject = { id: "", name: "", codeBlocks: {}, statistics: <StatisticModel>{ syntaxClones: [] } };
    public currentCloneList = [];
    public currentClone = [];

    constructor(private uploadService: UploadService, private dialog: MatDialog) { }

    ngOnInit() {
        this.currentProjectID = this.uploadService.getCurrentProject().id;
        this.getSourceCode()
    }

    getSourceCode() {
        this.uploadService.getSourceCode()
            .subscribe(
                (data) => {
                    this.projects = data.sort((a, b) => parseInt(b['id']) - parseInt(a['id']))
                    if (this.uploadService.getCurrentProject().id == "") {
                        this.currentProjectID = this.projects[0].id;
                    } else {
                        this.currentProjectID = this.uploadService.getCurrentProject().id;
                    }

                    this.loadTable()
                },
                (error: any) => console.log('error ', error)
            )
    }

    onSelectChanged(e) {
        this.currentProjectID = e
        this.loadTable()
    }

    loadTable() {

        //find currentProjectObject by ID
        let index = this.projects.findIndex(element => element.id == this.currentProjectID);
        this.currentProject = this.projects[index]

        this.uploadService.setCurrentProject(this.currentProject)

        //create CodeCloneObjects for table
        this.currentCloneList = [];
        let syntaxClones = this.currentProject.statistics.syntaxClones;
        let syntaxClonesArray = [];
        for (let code in syntaxClones) {
            syntaxClonesArray.push([syntaxClones[code]['1'], syntaxClones[code]['2']])
        }

        for (let codeBlock in this.currentProject.codeBlocks) {
            if ("CodeClones" in this.currentProject.codeBlocks[codeBlock]) {
                let codeClones = this.currentProject.codeBlocks[codeBlock].CodeClones;
                for (let clone of codeClones) {
                    let isSyntaxClone = "No";
                        if (this.arrayAlreadyHasArray(syntaxClonesArray, [codeBlock, clone]) || this.arrayAlreadyHasArray(syntaxClonesArray, [clone, codeBlock])) {
                            isSyntaxClone = "Yes"
                            this.currentCloneList.unshift([this.currentProject.codeBlocks[codeBlock], this.currentProject.codeBlocks[clone], isSyntaxClone])
                        } else {
                            this.currentCloneList.push([this.currentProject.codeBlocks[codeBlock], this.currentProject.codeBlocks[clone], isSyntaxClone])
                        }

                }
            }
        }

    }

    OpenModel(codePair) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        this.currentClone = codePair

        this.uploadService.setCurrentClonePairToView(this.currentClone)

        dialogConfig.position = {
            left: '30%',
            top: '7%'
        };
        dialogConfig.width = '850px'
        dialogConfig.height = '500px'

        this.dialog.open(CodeCompareComponent, dialogConfig);
    }

    public arrayAlreadyHasArray(arr, subarr) {
        for (var i = 0; i < arr.length; i++) {
            let checker = false
            for (var j = 0; j < arr[i].length; j++) {
                if (arr[i][j] === subarr[j]) {
                    checker = true
                } else {
                    checker = false
                    break;
                }
            }
            if (checker) {
                return true
            }
        }
        return false
    }

}