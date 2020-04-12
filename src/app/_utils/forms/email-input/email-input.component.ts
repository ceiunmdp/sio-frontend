import { Component, OnInit, Input } from '@angular/core';
import { FormElementComponent } from '../form-element/form-element.component';

@Component({
    selector: 'cei-email-input',
    templateUrl: './email-input.component.html',
    styleUrls: ['./email-input.component.scss']
})
export class EmailInputComponent extends FormElementComponent implements OnInit {

    @Input() clearable = false;

    constructor() {
        super();
    }

    ngOnInit() { }
}
