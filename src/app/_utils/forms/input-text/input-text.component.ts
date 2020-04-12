import { Component, OnInit, Input } from '@angular/core';
import { FormElementComponent } from '../form-element/form-element.component';

/** Error when invalid control is dirty, touched, or submitted. */
// export class MyErrorStateMatcher implements ErrorStateMatcher {
//    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
//       const isSubmitted = form && form.submitted;
//       return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
//    }
// }

@Component({
    selector: 'cei-input-text',
    templateUrl: './input-text.component.html',
    styleUrls: ['./input-text.component.scss']
})
export class InputTextComponent extends FormElementComponent implements OnInit {
    @Input() maxlength: number;
    @Input() type: number;



    constructor() {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
    }
}
