import { StringFilterByPipe } from './../../pipes/string-filter-by-pipe.pipe';
import { Component, OnInit, Input, Output, ViewChild, SimpleChanges } from '@angular/core';
import { FormElementComponent } from '../form-element/form-element.component';
import { EventEmitter } from '@angular/core';
import { SelectInputComponent } from '../select-input/select-input.component';
import { startWith, map, tap, filter, switchAll, debounce } from 'rxjs/operators';
import { Subject, Observable, timer, of } from 'rxjs';
import { MatSelect } from '@angular/material/select';
//!RESOLVER: Se selecciona el primer valor de la lista al buscar por el filter y cuando lo selecciono no se llama al onchange
@Component({
    selector: 'cei-select-searching-dynamic-input',
    templateUrl: './select-searching-dynamic-input.component.html',
    styleUrls: ['./select-searching-dynamic-input.component.scss']
})
export class SelectSearchingDynamicInputComponent extends FormElementComponent
    implements OnInit {
    @ViewChild('singleSelect', { static: true }) singleSelect: MatSelect;
    @Input() elements: Array<any>;
    @Input() httpGet: (value: string) => Observable<any>;
    @Input() nameSearching: string;
    @Input() placeholderNoValue: string;
    @Input() placeholderSearching: string;
    @Input() defaultValue;
    // Input provided that indicates if the values of the mat-options will be computed as strings or numbers
    @Input() forceNumber: string;
    // Functions provided by the parent that tells the component how to calculate the id and name of the options
    @Input() calculateId: (element) => string = (e) => !!e && !!e.id ? e.id : null;
    @Input() calculateName: (element) => string = (e) => !!e && !!e.name ? e.name : null;
    // Emit an event every time the select changes
    @Output() public selected: EventEmitter<any> = new EventEmitter();
    /** Subject that emits when the component has been destroyed. */
    /** list of banks filtered by search keyword */
    searchPipe = new StringFilterByPipe();
    searchingSpinner = false;
    storedValue;
    selectedElement
    public filteredValues;
    protected _onDestroy = new Subject<void>();
    get searchCtrl() {
        return this.form.get(this.nameSearching);
    }
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

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.
        !!this.elements && this.elements.length > 0 ? this.filteredValues = this.elements : null;
    }

    ngOnInit() {
        this.form.get(this.name).setValue(this.defaultValue);
        if (this.forceNumber) {
            // Subscribe at any change in the select form control and everytime a new option is
            // selected, convert the value to Number if it isn't
            this.form.get(this.name).valueChanges.subscribe(value => {
                if (typeof value === 'string') {
                    this.form.get(this.name).setValue(Number(value));
                }
            });
        }
        let temporalValue;
        !!this.elements && this.elements.length > 0 ? this.filteredValues = this.elements : null;

        this.searchCtrl.valueChanges
            .pipe(
                startWith(''),
                filter((value: string) => !!value && value.length > 0),
                debounce(value => (value.length > 1) ? timer(500) : timer(2500)),
                tap(_ => this.searchingSpinner = true),
                map(value => { temporalValue = value; return value == this.storedValue ? of(this.filteredValues) : this.httpGet(value) }),
                tap(_ => { this.searchingSpinner = false; this.storedValue = temporalValue }),
                switchAll()
            ).subscribe(values => {
                const id = this.form.get(this.name).value;
                this.selectedElement = !!this.filteredValues ? this.filteredValues.find(
                    element =>
                        this.proxyCalculateId()(element) ==
                        (this.forceNumber ? Number(id) : id)
                ) : null;
                this.filteredValues = !!this.selectedElement ? [...values, this.selectedElement] : values;
            });
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    calculateSelected(id) {
        let elementSelected = null;
        if (this.elements) {
            console.log(this.elements);

            elementSelected = this.elements.find(
                element =>
                    this.proxyCalculateId()(element) ==
                    (this.forceNumber ? Number(id) : id)
            );
        }
        return elementSelected;
    }

    change(event) {
        // Called everytime a new value is selected
        this.selected.emit(event.value);
    }
}
