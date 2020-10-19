import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertErrorComponent } from "./../_utils/forms/alert-error/alert-error.component";

@Injectable({
   providedIn: 'root',
})
export class AlertService {
   constructor(private _alertError: MatSnackBar) { }

   openError(message: string) {
      this._alertError.openFromComponent(AlertErrorComponent, {
         duration: 5000,
         data: { message },
      });
   }

   closeError() {
      this._alertError.dismiss();
   }
}
