import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'cei-alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
    static readonly ERROR = 'error';
    static readonly SUCCESS = 'success';

    @Input() type: string;
    @Input() message: string;


    constructor() { }

    ngOnInit() {
    }

}
