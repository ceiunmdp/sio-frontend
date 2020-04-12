import { Component, OnInit, Input } from '@angular/core';
import { FormElementComponent } from '../form-element/form-element.component';

@Component({
    selector: 'cei-text-input',
    templateUrl: './text-input.component.html',
    styleUrls: ['./text-input.component.scss']
})
export class TextInputComponent extends FormElementComponent implements OnInit {

    @Input() maxLength: number;
    @Input() clearable = false;

    constructor() {
        super();
    }

    ngOnInit() { }
}
