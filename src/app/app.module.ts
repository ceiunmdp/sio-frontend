import { CommonModule, registerLocaleData, DatePipe } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import localeEsAr from "@angular/common/locales/es-AR";
import { LOCALE_ID, NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule, MatInputModule, MatButtonModule, MatToolbarModule } from "@angular/material";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatTableModule } from "@angular/material/table";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { JwtInterceptor } from "./_helpers/jwt.interceptor";
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NgxAuthFirebaseUIModule } from 'ngx-auth-firebaseui';
// import * as firebase from 'firebase/app';
// import * as firebaseui from 'firebaseui';
registerLocaleData(localeEsAr, "es-Ar");


export var firebaseConfig = {
   apiKey: "AIzaSyAJb55Yooq3ftBhiKwn3Kvzpe4ZmJWALqQ",
   authDomain: "icei-d3c94.firebaseapp.com",
   databaseURL: "https://icei-d3c94.firebaseio.com",
   projectId: "icei-d3c94",
   storageBucket: "icei-d3c94.appspot.com",
   messagingSenderId: "993559184474",
   appId: "1:993559184474:web:42f65f61de64f8695c8463",
   measurementId: "G-FJ8YG6NC24"
};


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
      ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
      // NgxAuthFirebaseUIModule.forRoot(firebaseConfig),
      NgxAuthFirebaseUIModule.forRoot(firebaseConfig, () => 'your_app_name_factory',
         {
            toastMessageOnAuthSuccess: false, // whether to open/show a snackbar message on auth success - default : true
            toastMessageOnAuthError: false, // whether to open/show a snackbar message on auth error - default : true
            authGuardLoggedInURL: '/cei', // url for authenticated users - to use in combination with canActivate feature on a route
         }),
   ],
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
