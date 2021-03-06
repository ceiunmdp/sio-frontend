import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormElementComponent } from '../form-element/form-element.component';
import { MatCheckboxChange } from '@angular/material';

@Component({
  selector: 'cei-checkbox-input',
  templateUrl: './checkbox-input.component.html',
  styleUrls: ['./checkbox-input.component.scss']
})
export class CheckboxInputComponent extends FormElementComponent implements OnInit {
  @Output('change') change$ = new EventEmitter(null);


  constructor() {
    super();
  }

  ngOnInit() {
  }

  onChange(event: MatCheckboxChange) {
    this.change$.emit(event.checked)
  }

}
