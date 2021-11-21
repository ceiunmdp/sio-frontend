import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { AuthenticationService } from "src/app/_services/authentication.service";
import { GeneralService } from "src/app/_services/general.service";
import { HttpErrorResponseHandlerService } from "src/app/_services/http-error-response-handler.service";
import { USER_TYPES } from "src/app/_users/types";

@Component({
   selector: "cei-toggle-theme",
   templateUrl: "./toggle-theme.component.html",
   styleUrls: ["./toggle-theme.component.scss"]
})
export class ToggleThemeComponent implements OnInit {
   @ViewChild("alertError", { static: true }) alertError;
   messageError: string;
   isDarkTheme: boolean;
   public userType = USER_TYPES;
   constructor(private router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,private generalService: GeneralService, public authService: AuthenticationService) {}

   ngOnInit() {
      // this.isDarkTheme = this.authService.currentUserValue ? !!this.authService.currentUserValue.darkTheme : false;
      this.generalService.getDarkTheme().subscribe(darkTheme => {
        console.log('se seteo', darkTheme);
         this.isDarkTheme = darkTheme;
      });
   }

   filteredLinks = () => this.authService.currentUserValue.links.filter(link => link.code === 'instagram_link' || link.code === 'facebook_link');

   toggleDarkTheme(checked: boolean) {
      console.log('se seteo', checked);
      this.generalService.setDarkTheme(checked);
      this.authService.setDarkTheme(checked).subscribe(response => {
      }, e => {this.handleErrors(e)}
      )

   }

   handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
         this.alertError.openError(this.messageError);
      }
   }
}
