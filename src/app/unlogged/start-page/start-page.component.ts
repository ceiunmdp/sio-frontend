import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import * as jwt_decode from "jwt-decode";
import { Payload } from "src/app/_models/payload";
import { User } from "src/app/_models/users/user";
import { Routes } from "src/app/_routes/routes";
import { AuthenticationService } from "src/app/_services/authentication.service";
import { GeneralService } from "src/app/_services/general.service";
import { UnloggedService } from "../unlogged.service";
import {
   AbstractModelSettings,
   AdhocModelSettings,
   ModelSettingsBuilder,
   ReactiveFormsRuleService
} from "ng-form-rules";
import { UserLogin } from "src/app/_models/users/user-login";
import { UserRegister } from "src/app/_models/users/user-register";
import { HttpErrorResponseHandlerService } from "src/app/_services/http-error-response-handler.service";
import { CustomValidators } from "src/app/_validators/custom-validators";
import { MatTabGroup } from "@angular/material";

@Component({
   selector: "cei-start-page",
   templateUrl: "./start-page.component.html",
   styleUrls: ["./start-page.component.scss"]
})
export class StartPageComponent implements OnInit {
   @ViewChild("alertError", { static: true }) alertError;
   @ViewChild("tabs", { static: true }) tabGroup: MatTabGroup;
   @ViewChild("registerSuccessSwal", { static: true }) registerSuccessSwal;

   messageError: string;
   formRegister: FormGroup;
   typeAlert: string;
   messageAlert: string;
   selectedTab = 0;

   /** Form Login */
   public readonly EMAIL = "email";
   public readonly PASSWORD = "password";
   formLogin: FormGroup;

   constructor(
      private formBuilder: FormBuilder,
      private svc: ReactiveFormsRuleService,
      private generalService: GeneralService,
      private authService: AuthenticationService,
      private unloggedService: UnloggedService,
      private router: Router,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
   ) {}

   ngOnInit() {
      this.formLogin = this.createFormLogin();
      this.formRegister = this.svc.createFormGroup(this.createSettingRegister());
   }

   createFormLogin(): FormGroup {
      return this.formBuilder.group({
         [this.EMAIL]: [
            "",
            [
               CustomValidators.required("Email requerido"),
               CustomValidators.email("Ingrese un formato de email correcto")
            ]
         ],
         [this.PASSWORD]: [
            "",
            [
               CustomValidators.required("Contraseña requerida"),
               CustomValidators.password(
                  "La contraseña debe estar conformada por un mínimo de 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial"
               )
            ]
         ]
      });
   }

   createSettingRegister(): AbstractModelSettings<UserRegister> {
      return AdhocModelSettings.create<UserRegister>((builder: ModelSettingsBuilder) => {
         return [
            builder.property("name", prop => {
               prop.valid.push(
                  builder.validTest(
                     `Nombre requerido`,
                     builder.rule(formRegister => !!formRegister.name)
                  )
               );
            }),
            builder.property("surname", prop => {
               prop.valid.push(
                  builder.validTest(
                     `Email requerido`,
                     builder.rule(formRegister => !!formRegister.surname)
                  )
               );
            }),
            builder.property("email", prop => {
               prop.valid.push(
                  builder.validTest(
                     `Email requerido`,
                     builder.rule(formRegister => !!formRegister.email)
                  )
               );
            }),
            builder.property("dni", prop => {
               prop.valid.push(
                  builder.validTest(
                     `DNI requerido`,
                     builder.rule(formRegister => !!formRegister.dni)
                  )
               );
            }),
            builder.property("password", prop => {
               prop.valid.push(
                  builder.validTest(
                     `Contraseña requerida`,
                     builder.rule(formRegister => !!formRegister.password)
                  )
               );
            })
            // builder.property('contrasenaConfirm', prop => {
            //     prop.valid.push(
            //         builder.validTest(`Contraseña requerida`, builder.rule(formRegister => !!formRegister.contrasenaConfirm))
            //     );
            // })
         ];
      });
   }

   onLogin() {
      this.unloggedService.login(this.formLogin.value).subscribe(
         loginResponse => {
            const token: string = loginResponse.token;
            if (token) {
               this.authService.updateCurrentUser({
                  token
               });
               const payload: Payload = jwt_decode(token);
               console.warn("Payload: ", payload);
               this.authService.getUserData().subscribe(
                  (user: User) => {
                     console.log("usuario: ", user);

                     // TODO: Make some subinterfaces of User to manage the multiple types
                     // TODO: Decide if store the 'type' or not in the Local Storage
                     user.token = token;
                     //  user.id = payload.id;

                     // Store user details and jwt token in local storage to keep user logged in between page refreshes
                     this.authService.updateCurrentUser(user);

                     // Set the theme
                     this.generalService.setDarkTheme(!!user.darkTheme);
                     // this.alertError.openError('nada');
                     this.alertError.closeError();
                     if (this.authService.redirectUrl) {
                        this.router.navigate([this.authService.redirectUrl]);
                        // this.authService.RedirectUrl = null;
                     } else {
                        this.router.navigate(["/cei/home"]);
                     }
                  },
                  (error: HttpErrorResponse) => {
                     this.handleErrors(error);
                  }
               );
            } else {
               console.log("no token");
            }
         },
         (error: HttpErrorResponse) => {
            this.handleErrors(error);
         }
      );
   }

   onRegister() {
      console.log(this.formRegister);
      this.unloggedService.register(this.formRegister.value).subscribe(
         res => {
            this.registerSuccessSwal.fire();
            // this.router.navigate(['/']);
         },
         err => this.handleErrors(err)
      );
   }

   cleanForms() {
      this.formLogin = this.createFormLogin();
      this.formRegister = this.svc.createFormGroup(this.createSettingRegister());
      this.tabGroup.selectedIndex = 0;
      this.alertError.closeError();
   }

   handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
         this.alertError.openError(this.messageError);
      }
   }
}
