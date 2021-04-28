import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormElementComponent } from '../form-element/form-element.component';

@Component({
    selector: 'cei-select-input',
    templateUrl: './select-input.component.html',
    styleUrls: ['./select-input.component.scss']
})
export class SelectInputComponent extends FormElementComponent implements OnInit {

    @Input() elements: Array<any>;
    @Input() defaultValue: string;
    // Input provided that indicates if the values of the mat-options will be computed as strings or numbers
    @Input() forceNumber: string;
    // Functions provided by the parent that tells the component how to calculate the id and name of the options
    @Input() calculateId: (element) => string = (element: any) => {
        return element ? element.id : null;
    };
    @Input() calculateName: (element) => string = (element: any) => {
        return element ? element.name : null;
    };;
    @Input() multiple: boolean; // Undefined by default
    // Emit an event every time the select changes
    @Output() public selected: EventEmitter<any> = new EventEmitter();

    constructor() {
        super();
    }

    // Static function that returns the appropriate function according to the "calculate" parameter
    static proxyCalculate(calculate): (element) => string {
        if (typeof calculate === 'string') {
            return element => {
                return element ? element[String(calculate)] : null;
            };
        } else {
            return calculate;
        }
    }

    // Proxy that calls the proxyCalculate function with a function or string that tells this component how to calculate the Id
    proxyCalculateId(): (element) => string {
        return SelectInputComponent.proxyCalculate(this.calculateId);
    }

    // Proxy that calls the proxyCalculate function with a function or string that tells this component how to calculate the Name
    proxyCalculateName(): (element) => string {
        return SelectInputComponent.proxyCalculate(this.calculateName);
    }

    ngOnInit() {
        if (this.forceNumber) {
            // Subscribe at any change in the select form control and everytime a new option is
            // selected, convert the value to Number if it isn't
            this.form.get(this.name).valueChanges.subscribe(value => {
                if (typeof value === 'string') {
                    this.form.get(this.name).setValue(Number(value));
                }
            });
        }
    }

    calculateSelected(id) {
        let elementSelected = null;
        if (this.elements) {
            elementSelected = this.elements.find(
                element =>
                    this.proxyCalculateId()(element) ===
                    (this.forceNumber ? Number(id) : id)
            );
        }
        return elementSelected;
    }

    change(event) {
        // Called everytime a new value is selected
        console.log(this.calculateSelected(event.value));
        console.log(event);

        this.selected.emit(this.calculateSelected(event.value));
    }
}
