import { Component, OnInit } from '@angular/core';
import { FormBuilder,FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SourceCodeModel } from 'src/app/services/Models/sourceCodeModel';
import { UploadService } from '../../services/upload.service';
import { RedirectDialogComponent } from '../redirect_dialog/redirect_dialog.component';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
    selector: 'upload-cmp',
    moduleId: module.id,
    templateUrl: 'upload.component.html'
})

export class UploadComponent implements OnInit {

    public buttonDisabled = false 

    public name = new FormControl('', [
        Validators.required,
        Validators.maxLength(100)
      ]);
    
    public path = new FormControl('', [Validators.required]);

    public uploadForm = this.formBuilder.group({
        name: this.name,
        path: this.path
    });
    public file:File;
    public hideProgressBar = true;

    public projects: SourceCodeModel[] | undefined;

    constructor(private formBuilder: FormBuilder, public uploadService: UploadService
        ,private dialog : MatDialog , private notif : NotificationsComponent) { }

    ngOnInit() {
        this.getSourceCode()
    }

    getSourceCode() {
        this.uploadService.getSourceCode()
            .subscribe(
                (data) => {
                    this.projects = data.sort((a, b) => parseInt(b['id']) - parseInt(a['id']))
                },
                error => console.log('error ', error)
            )
    }

    public onSubmit(): void {
        this.uploadForm.disable()
        this.buttonDisabled = true
        this.hideProgressBar = false;
        let newIndex;
        if(this.projects != null || undefined){
            newIndex = this.projects[0].id
        }
        else{
            newIndex = 1
        }
        //newIndex = 1

        const formData = new FormData();

        formData.append("file", this.file);
      
        this.uploadService.addSourceCode(this.uploadForm.value.name, formData,newIndex).subscribe(
            () => {
                this.uploadForm.enable()
                this.uploadForm.reset()
                this.buttonDisabled = false
                this.getSourceCode()
                this.hideProgressBar = true;
                this.uploadService.resetPostProgress()
                this.uploadService.resetPostStatus()
                this.notif.showNotification('top','right',2,"Project Upload was Successful!")
            },
            error => {
                this.uploadService.stopSubscription()
                this.uploadForm.enable()
                this.buttonDisabled = false
                this.getSourceCode()
                console.log('error ', error)
                this.hideProgressBar = true;
                this.uploadService.resetPostProgress()
                this.uploadService.resetPostStatus()
                this.notif.showNotification('top','right',4,error.error.text)
            }
        )
    }
    public onFileUpload(e){
        this.file =  e.target.files[0];
    }

    public selectProject(project){
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        this.uploadService.setCurrentProject(project)

        this.dialog.open(RedirectDialogComponent, dialogConfig);
    }

}



