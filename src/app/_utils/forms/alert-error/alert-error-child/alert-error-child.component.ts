import { Component, OnInit, Inject, Input } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material';

@Component({
    selector: 'cei-alert-error-child',
    templateUrl: './alert-error-child.component.html',
    styleUrls: ['./alert-error-child.component.scss']
})
export class AlertErrorChildComponent implements OnInit {
    message: string;
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
        this.message = data.message;
    }

    ngOnInit() { }
}
