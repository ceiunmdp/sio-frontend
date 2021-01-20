import { Component, OnInit, Inject } from "@angular/core";
import { MatSnackBar, MAT_SNACK_BAR_DATA } from "@angular/material";
import { AlertErrorChildComponent } from "./alert-error-child/alert-error-child.component";

@Component({
   selector: "cei-alert-error",
   templateUrl: "./alert-error.component.html",
   styleUrls: ["./alert-error.component.scss"]
})
export class AlertErrorComponent implements OnInit {
   message: string;
   constructor(
      @Inject(MAT_SNACK_BAR_DATA)
      public data: any,
   ) {
      this.message = data.message;
   }

   ngOnInit() { }
}
