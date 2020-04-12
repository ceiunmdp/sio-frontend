import { Component, OnInit, Input } from "@angular/core";
import { FormElementComponent } from "../form-element/form-element.component";

@Component({
   selector: "cei-number-input",
   templateUrl: "./number-input.component.html",
   styleUrls: ["./number-input.component.scss"]
})
export class NumberInputComponent extends FormElementComponent implements OnInit {
   @Input() minValue: number;
   @Input() maxValue: number;
   showPrefix = false;
   constructor() {
      super();
   }

   mostrar() {
      console.log(this.form.get(this.name).value);
   }

   ngOnInit() {}
}
