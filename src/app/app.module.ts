import { CommonModule, registerLocaleData, DatePipe } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import localeEsAr from "@angular/common/locales/es-AR";
import { LOCALE_ID, NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule, MatInputModule, MatButtonModule } from "@angular/material";
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

registerLocaleData(localeEsAr, "es-Ar");
@NgModule({
   declarations: [AppComponent, NotFoundComponent],
   imports: [
      CommonModule,
      BrowserModule,
      BrowserAnimationsModule,
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
      MatButtonModule
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
export class AppModule {}
