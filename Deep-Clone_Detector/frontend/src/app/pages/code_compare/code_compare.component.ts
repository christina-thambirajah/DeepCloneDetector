import { Component } from "@angular/core";
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from "@angular/material/dialog";
import { UploadService } from "src/app/services/upload.service";

@Component({
    selector: 'code-compare-cmp',
    moduleId: module.id,
    templateUrl: 'code_compare.component.html'
})

export class CodeCompareComponent
{
    form: FormGroup;
    description:string;

    public CB1 = {Code: "", FileName: "", Start:"", End: "" };
    public CB2 = {Code: "", FileName: "", Start:"", End: "" };

    constructor(
        private dialogRef: MatDialogRef<CodeCompareComponent>,
        private uploadService:UploadService){}

    ngOnInit() {

        let codePair = this.uploadService.getClonePairToView()
        this.CB1 = codePair[0]
        this.CB2 = codePair[1]
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
