import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { FormElementComponent } from "../form-element/form-element.component";

@Component({
   selector: "cei-number-input",
   templateUrl: "./number-input.component.html",
   styleUrls: ["./number-input.component.scss"]
})
export class NumberInputComponent extends FormElementComponent implements OnInit {
   @Input() minValue: number;
   @Input() maxValue: number;
   // @Output('change') change$ = new EventEmitter(null);

   showPrefix = false;

   constructor() {
      super();
   }

   ngOnInit() { }

}
