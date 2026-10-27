import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../environments/environment';
import {SourceCodeModel} from './Models/sourceCodeModel';
import { ClonesComponent } from '../pages/clones/clones.component';
import { Observable, Subscription } from 'rxjs';
import { interval } from 'rxjs';'rxjs/add/observable/interval';

@Injectable()
export class UploadService {
 
  constructor(private http: HttpClient) { }

  private sourceCodeAllURL = environment.backendURL.concat('/all');
  private addsourceCodeAllURL = environment.backendURL.concat('/add?name=[sourceCodeName]');
  private deleteSourceCodeURL = environment.backendURL.concat('?id=[id]');
  private clonePairToView;
  private previousProject = {id:"",name:""};
  private currentProject = {id:"",name:""};
  private cloneGroupCode;
  private currentSuggestion;
  private sub: Subscription;
  private postStatus;
  private postProgress;

  getSourceCode(){
      return this.http.get<SourceCodeModel[]>(this.sourceCodeAllURL)
  }

  deleteSourceCode(id){
    let URL = this.deleteSourceCodeURL.replace('[id]',id)
    return this.http.delete(URL)
  }

  addSourceCode(name:string,file:FormData,id:string){
    this.sub = interval(2000).subscribe((val) => { 
      this.getStatus(id)
    });
    let fetchURL = this.addsourceCodeAllURL.replace('[sourceCodeName]',name)
    return this.http.post(fetchURL,file)
    }

  getStatus(postID:string){
    let id;
    this.http.get<SourceCodeModel[]>(this.sourceCodeAllURL).subscribe((projects)=>{
      projects = projects.sort((a, b) => parseInt(b['id']) - parseInt(a['id']))
      id = projects[0].id
      if((parseInt(postID)+1).toString() == id){
      this.postStatus = projects[0].status
      this.updatePostProgress(this.postStatus);
      }
      if(((parseInt(postID)+1).toString() == id )&& (this.postStatus=="Completed")){
      this.stopSubscription()
    }
    })
  }

  stopSubscription(){
    this.sub.unsubscribe()
  }

  getPostStatus(){
    return this.postStatus;
  }

  resetPostStatus(){
    this.postStatus = ""
  }

  resetPostProgress(){
    this.postProgress = 0;
  }


  updatePostProgress(status){
    if(status=="Fetching Files"){
      this.postProgress = 5;
    }else if(status=="Process Initiated"){
      this.postProgress = 10;
    }else if(status=="Extracting Code Blocks"){
      this.postProgress = 20;
    }else if(status=="Initiating Clone Detection"){
      this.postProgress = 25;
    }else if(status=="Tokenizing Code Blocks"){
      this.postProgress = 30;
    }else if(status=="Performing Feature Extraction"){
      this.postProgress = 40;
    }else if(status=="Paring Up Code Blocks"){
      this.postProgress = 50;
    }else if(status=="Performing Classification"){
      this.postProgress = 60;
    }else if(status=="Performing Clone Analysis"){
      this.postProgress = 70;
    }else if(status=="Completing Clone Detection"){
      this.postProgress = 80;
    }else if(status=="Updating Detected Information"){
      this.postProgress = 90;
    }else if(status=="Finishing Process"){
      this.postProgress = 95;
    }else if(status=="Removing Temporary Files"){
      this.postProgress = 98;
    }else if(status=="Completed"){
      this.postProgress = 100;
    }
  }

  getPostProgress(){
    return this.postProgress;
  }
  

  setCurrentClonePairToView(clonePair){
    this.clonePairToView = clonePair;
  }

  getClonePairToView(){
    return this.clonePairToView;
  }

  setCurrentProject(currentProject){
    this.previousProject = this.currentProject;
    this.currentProject = currentProject;
  }

  getCurrentProject(){
    return this.currentProject;
  }

  setPreviousAsCurrentProject(){
    this.currentProject = this.previousProject
  }

  setCurrentCloneGroupCode(code){
    this.cloneGroupCode = code
  }

  getCurrentCloneGroupCode(){
    return this.cloneGroupCode;
  }

  setCurrentSuggestion(item){
    this.currentSuggestion = item
  }

  getCurrentSuggestion(){
    return this.currentSuggestion;
  }
  
}