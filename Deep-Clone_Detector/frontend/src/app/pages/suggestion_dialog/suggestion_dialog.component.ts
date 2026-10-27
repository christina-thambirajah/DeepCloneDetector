import { Component } from "@angular/core";
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from "@angular/material/dialog";
import { UploadService } from "src/app/services/upload.service";

@Component({
    selector: 'suggestion_dialog-cmp',
    moduleId: module.id,
    templateUrl: 'suggestion_dialog.component.html'
})

export class SuggestionDialogComponent
{
    form: FormGroup;
    description:string;

    public CB1 = {Code: "", FileName: "", Start:"", End: "" };
    public CB2 = {Code: "", FileName: "", Start:"", End: "" };
    public suggestion = "";

    constructor(
        private dialogRef: MatDialogRef<SuggestionDialogComponent>,
        private uploadService:UploadService){}

    ngOnInit() {

        let suggestionItem = this.uploadService.getCurrentSuggestion()
        this.suggestion = suggestionItem[0]
        
        this.CB1 = suggestionItem[1]
        this.CB2 = suggestionItem[2]
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
