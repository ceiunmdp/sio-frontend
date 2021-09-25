import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';
import { CODE_FIREBASE_AUTH } from 'src/app/_api/codeFirebaseAuth';
import { User } from "src/app/_models/users/user";
import { AuthenticationService } from "src/app/_services/authentication.service";
import { HttpErrorResponseHandlerService } from "src/app/_services/http-error-response-handler.service";

@Component({
   selector: "cei-start-page",
   templateUrl: "./start-page.component.html",
   styleUrls: ["./start-page.component.scss"]
})
export class StartPageComponent implements OnInit, OnDestroy {
   @ViewChild("alertError", { static: true }) alertError;
   messageError: string;
   typeAlert: string;
   messageAlert: string;
  _authState: Subscription;

   constructor(
      private authService: AuthenticationService,
      private router: Router,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,
      private afAuth: AngularFireAuth
   ) { }

   ngOnInit() {
      console.log('inicio auth')
      this._authState = this.afAuth.authState.subscribe(user => {
         if (!!user.email && !!user.emailVerified) {
            console.log('entro y llama a onsucess')
            this.onSuccess(user);
         }
      })
   }

   ngOnDestroy(): void {
   //   Called once, before the instance is destroyed.
   //   Add 'implements OnDestroy' to the class.
     this._authState.unsubscribe();
   }

   onSuccess(e) {
      console.log('entro al on success')
      const u: User = {
         token: e.xa,
      }
      this.authService.updateCurrentUser(u);
      this.authService.getUserData().toPromise()
         .then((u: Partial<User>) => {
            this.authService.updateCurrentUser(u);
            if (this.authService.redirectUrl) {
               this.router.navigate(/*TODO rootpath*/[this.authService.redirectUrl]);
            } else {
               this.router.navigate([u.rootPath]);
            }
         })
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
         case CODE_FIREBASE_AUTH.EMAIL_EXISTS:
            message = 'El e-mail ya existe'
            break;
         case CODE_FIREBASE_AUTH.USER_DISABLED:
            message = 'Su cuenta ha sido deshabilitada por el administrador'
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
