import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UploadService } from "src/app/services/upload.service";
import {Router} from "@angular/router"
import { DeleteDialogComponent } from "../delete_dialog/delete_dialog.component";

declare var require: any;

@Component({
    selector: 'redirect_dialog_cmp',
    moduleId: module.id,
    templateUrl: 'redirect_dialog.component.html'
})

export class RedirectDialogComponent
{

    public currentProject = {id:"",name:""};
    public buttonDisabled = false

    constructor(
        private dialogRef: MatDialogRef<RedirectDialogComponent>,
        private dialog : MatDialog,
        private uploadService:UploadService,private router: Router){}

    ngOnInit() {
        this.currentProject = this.uploadService.getCurrentProject()
        if ('deletable' in this.currentProject){
            this.buttonDisabled = true;
        }else{
            this.buttonDisabled = false;
            }
    }

    viewAnalytics() {
        this.dialogRef.close();
        this.router.navigate(['/analytics'])
    }

    viewClones() {
        this.dialogRef.close();
        this.router.navigate(['/clones'])
    }

    DeleteSourceCode(){
        this.dialogRef.close();
        this.uploadService.setPreviousAsCurrentProject()
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.data = {
            project: this.currentProject
          }

        this.dialog.open(DeleteDialogComponent, dialogConfig);
    }
    
    close() {
        this.uploadService.setPreviousAsCurrentProject()
        this.dialogRef.close();
    }
}
