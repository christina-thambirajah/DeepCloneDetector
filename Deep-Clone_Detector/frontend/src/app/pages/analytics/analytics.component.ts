import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SourceCodeModel, StatisticModel } from 'src/app/services/Models/sourceCodeModel';
import { UploadService } from 'src/app/services/upload.service';
import { CodeCompareComponent } from '../code_compare/code_compare.component';
import { CodeGroupDialog } from '../code_group_dialog/code_group_dialog.component';
import { SuggestionDialogComponent } from '../suggestion_dialog/suggestion_dialog.component';


@Component({
  selector: 'analytics-cmp',
  moduleId: module.id,
  templateUrl: 'analytics.component.html'
})

export class AnalyticsComponent implements OnInit {
  public projects: SourceCodeModel[];
  public currentProjectID: string = "";
  public currentProject = { id: "", name: "", codeBlocks: {}, statistics: <StatisticModel>{ clonePercentage: "", cloneGroups: [] },suggestions:[{suggestion:"",codeBlock:"",clone:""}]};
  public currentCloneList = [];
  public currentCode = {};
  public suggestionList = [];
  public currentSuggestion = [];

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

          this.loadData()
        },
        (error: any) => console.log('error ', error)
      )
  }

  onSelectChanged(e) {
    this.currentProjectID = e
    this.loadData()
  }

  loadData() {

    this.currentCloneList = [];
    this.currentCode = {};
    this.suggestionList = [];
    this.currentSuggestion = [];

    //find currentProjectObject by ID
    let index = this.projects.findIndex(element => element.id == this.currentProjectID);
    this.currentProject = this.projects[index]

    this.uploadService.setCurrentProject(this.currentProject)

    //create CodeCloneObjects for table
    let currentCloneList = []

    for (let cloneGroup in this.currentProject.statistics.cloneGroups) {
      let cloneArray: [] = this.currentProject.statistics.cloneGroups[cloneGroup]
      let tempArray = []
      for (let codeBlock of cloneArray) {
         tempArray.push(this.currentProject.codeBlocks[codeBlock])
      }
      currentCloneList.push([cloneGroup,tempArray])
    }

    currentCloneList.sort((a, b) => {
      return parseInt(a[0].split('p')[1]) - parseInt(b[0].split('p')[1]);
    });
    
    this.currentCloneList = currentCloneList

    for (let item of this.currentProject.suggestions) {
      let codeObject =  this.currentProject.codeBlocks[item.codeBlock]
      let cloneObject = this.currentProject.codeBlocks[item.clone]
      
      this.suggestionList.push([item.suggestion,codeObject,cloneObject])
    }
    console.log(this.suggestionList)



  }

  OpenModel(code) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    this.currentCode = code

    this.uploadService.setCurrentCloneGroupCode(this.currentCode)

    dialogConfig.position = {
        left: '30%',
        top: '7%'
    };
    dialogConfig.width = '850px'
    dialogConfig.height = '500px'

    this.dialog.open(CodeGroupDialog, dialogConfig);
}

  OpenModelSuggestion(item){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    this.currentSuggestion = item

    this.uploadService.setCurrentSuggestion(this.currentSuggestion)

    dialogConfig.position = {
        left: '30%',
        top: '7%'
    };
    dialogConfig.width = '850px'
    dialogConfig.height = '500px'

    this.dialog.open(SuggestionDialogComponent, dialogConfig);
    
  }




}
