import { Component, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { UploadService } from "src/app/services/upload.service";
import {Router} from "@angular/router"
import { RedirectDialogComponent } from "../redirect_dialog/redirect_dialog.component";
import { NotificationsComponent } from "../notifications/notifications.component";

declare var require: any;

@Component({
    selector: 'delete_dialog_cmp',
    moduleId: module.id,
    templateUrl: 'delete_dialog.component.html'
})

export class DeleteDialogComponent
{

    public currentProject = {id:"",name:""};
    public buttonDisabled = false;

    constructor(
        private dialogRef: MatDialogRef<DeleteDialogComponent>,
        private uploadService:UploadService,private router: Router,
        private notif:NotificationsComponent,
         @Inject(MAT_DIALOG_DATA) public data: any){}

    ngOnInit() {
        this.currentProject = this.data.project
    }

    performDelete() {
        this.buttonDisabled = true
        this.uploadService.deleteSourceCode(this.currentProject.id).subscribe(()=>{
            this.buttonDisabled = false
            this.dialogRef.close();
            this.router.navigate(['/upload']) .then(() => {
                window.location.reload();
              });
            this.notif.showNotification('top','right',2,"Project was deleted was successfully")
        });
    }
    
    close() {
        this.dialogRef.close();
    }
}
