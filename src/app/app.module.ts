import { CommonModule, DatePipe, registerLocaleData } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import localeEsAr from "@angular/common/locales/es-AR";
import { LOCALE_ID, NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule, MatFormFieldModule, MatInputModule, MatToolbarModule } from "@angular/material";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatTableModule } from "@angular/material/table";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from '@angular/service-worker';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
import { environment } from '../environments/environment';
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { ChangePasswordDialogModule } from "./shared/change-password-dialog/change-password-dialog.module";
import { DniDialogModule } from "./shared/dni-dialog/dni-dialog.module";
import { ProfileDialogModule } from "./shared/profile-dialog/profile-dialog.module";
import { JwtInterceptor } from "./_helpers/jwt.interceptor";
import { AlertErrorChildComponent } from "./_utils/forms/alert-error/alert-error-child/alert-error-child.component";
import { AlertErrorComponent } from "./_utils/forms/alert-error/alert-error.component";
import { UtilsModule } from "./_utils/utils.module";

// import * as firebase from 'firebase/app';
// import * as firebaseui from 'firebaseui';
registerLocaleData(localeEsAr, "es-Ar");


export var firebaseConfig = environment.firebaseConfig;
export function fbfunction() { return 'my_factory' };


@NgModule({
   declarations: [AppComponent, NotFoundComponent],
   imports: [
      CommonModule,
      BrowserModule,
      BrowserAnimationsModule,
      MatToolbarModule,
      AppRoutingModule,
      FlexLayoutModule,
      ReactiveFormsModule,
      MatListModule,
      MatDividerModule,
      MatIconModule,
      HttpClientModule,
      MatTableModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      UtilsModule,
      DniDialogModule,
      ProfileDialogModule,
      ChangePasswordDialogModule,
      ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
      // NgxAuthFirebaseUIModule.forRoot(firebaseConfig),
      NgxAuthFirebaseUIModule.forRoot(firebaseConfig, fbfunction,
         {
            toastMessageOnAuthSuccess: false, // whether to open/show a snackbar message on auth success - default : true
            toastMessageOnAuthError: false, // whether to open/show a snackbar message on auth error - default : true
            enableFirestoreSync: false,
            authGuardLoggedInURL: '/cei', // url for authenticated users - to use in combination with canActivate feature on a route
         }),
   ],
   entryComponents: [AlertErrorComponent, AlertErrorChildComponent],
   providers: [
      {
         provide: HTTP_INTERCEPTORS,
         useClass: JwtInterceptor,
         multi: true
      },
      { provide: LOCALE_ID, useValue: "es-Ar" },
      DatePipe
   ],
   bootstrap: [AppComponent]
})
export class AppModule { }

