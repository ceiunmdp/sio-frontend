import { Component, OnInit, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";

@Component({
   selector: "cei-form-element",
   templateUrl: "./form-element.component.html",
   styleUrls: ["./form-element.component.scss"]
})
export class FormElementComponent implements OnInit {
   @Input() form: FormGroup;
   @Input() fontSize: number;
   @Input() prefix: string;
   @Input() name: string;
   @Input() label: string;
   @Input() hint: string;
   @Input() icon: string;
   @Input() placeholder: string; // Undefined by default
   @Input() readonly: boolean; // Undefined by default
   @Input() disabled: boolean; // Undefined by default
   objectValues = Object.values;

   constructor() {}

   ngOnInit() {}
}
