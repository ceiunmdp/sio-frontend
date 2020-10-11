import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { CODE_FIREBASE_AUTH } from 'src/app/_api/codeFirebaseAuth';
import { User } from "src/app/_models/users/user";
import { AuthenticationService } from "src/app/_services/authentication.service";
import { HttpErrorResponseHandlerService } from "src/app/_services/http-error-response-handler.service";

@Component({
   selector: "cei-start-page",
   templateUrl: "./start-page.component.html",
   styleUrls: ["./start-page.component.scss"]
})
export class StartPageComponent implements OnInit {
   @ViewChild("alertError", { static: true }) alertError;
   messageError: string;
   typeAlert: string;
   messageAlert: string;

   constructor(
      private authService: AuthenticationService,
      private router: Router,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,
   ) { }

   ngOnInit() {
   }

   onSuccess(e) {
      const u: User = {
         token: e.xa,
      }
      this.authService.updateCurrentUser(u);
      this.authService.getUserData().subscribe((u: Partial<User>) => {
         this.authService.updateCurrentUser(u);
      });
      if (this.authService.redirectUrl) {
         this.router.navigate([this.authService.redirectUrl]);
      } else {
         this.router.navigate(["/cei/home"]);
      }
   }

   onError(e) {
      let message: string;
      switch (e.code) {
         case CODE_FIREBASE_AUTH.EMAIL_NOT_FOUND:
            message = 'Usuario no encontrado'
            break;
         case CODE_FIREBASE_AUTH.INVALID_PASSWORD:
            message = 'Contraseña incorrecta'
            break;
         default:
            message = 'Ha ocurrido un error'
            break;
      }
      this.alertError.openError(message);
   }

   handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
         this.alertError.openError(this.messageError);
      }
   }
}
