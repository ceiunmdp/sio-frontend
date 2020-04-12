import { Component, OnInit } from '@angular/core';
import { TextInputComponent } from '../text-input/text-input.component';

@Component({
    selector: 'cei-password-input',
    templateUrl: './password-input.component.html',
    styleUrls: ['./password-input.component.scss']
})
export class PasswordInputComponent extends TextInputComponent implements OnInit {

    hide = true;
    constructor() {
        super();
    }

    ngOnInit() { }
}
