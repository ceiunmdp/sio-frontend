import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
    selector: 'cei-files-config',
    templateUrl: './files-config.component.html',
    styleUrls: ['./files-config.component.scss']
})
export class FilesConfigComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<FilesConfigComponent>,
        @Inject(MAT_DIALOG_DATA) public data) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
    }

}
