import { Component, OnInit, Input } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { AlertErrorChildComponent } from "./alert-error-child/alert-error-child.component";

@Component({
   selector: "cei-alert-error",
   templateUrl: "./alert-error.component.html",
   styleUrls: ["./alert-error.component.scss"]
})
export class AlertErrorComponent implements OnInit {
   // tslint:disable-next-line: variable-name
   constructor(private _snackBar: MatSnackBar) {}

   ngOnInit() {}

   openError(message: string) {
      this._snackBar.openFromComponent(AlertErrorChildComponent, {
         duration: 5000,
         data: { message }
      });
   }

   closeError() {
      /* Error: Si no abro un nuevo snackbar, en caso de que haya otro snack abierto por otra instancia
        de alert error, el dismiss no lo cerrará
        TODO: Ver como resolverlo. Como cerrar todos los snack o hacer un ss de alert error */

      // this.openError('nada');
      // setInterval(()=>{

      //     this._snackBar.dismiss();
      // },0);
      this._snackBar.dismiss();
   }
}
