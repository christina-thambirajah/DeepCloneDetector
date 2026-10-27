import { Component } from "@angular/core";
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from "@angular/material/dialog";
import { UploadService } from "src/app/services/upload.service";

@Component({
    selector: 'code_group_dialog-cmp',
    moduleId: module.id,
    templateUrl: 'code_group_dialog.component.html'
})

export class CodeGroupDialog
{
    form: FormGroup;
    description:string;

    public CB1 = {Code: "", FileName: "", Start:"", End: "" };

    constructor(
        private dialogRef: MatDialogRef<CodeGroupDialog>,
        private uploadService:UploadService){}

    ngOnInit() {

        let code = this.uploadService.getCurrentCloneGroupCode()
        this.CB1 = code
    }
    
    close() {
        this.dialogRef.close();
    }

    public formatSourceCode(code){
        let newString1 = code.replace(/;/g,';\r\n')
        let newString2 = newString1.replace(/{/g,'{\r\n')
        let newString3 = newString2.replace(/}/g,'}\r\n')

        return newString3
    }
}
