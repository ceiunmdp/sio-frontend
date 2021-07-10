import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services/authentication.service";
import { GeneralService } from "src/app/_services/general.service";
import {USER_TYPES} from "src/app/_users/types";

@Component({
   selector: "cei-toggle-theme",
   templateUrl: "./toggle-theme.component.html",
   styleUrls: ["./toggle-theme.component.scss"]
})
export class ToggleThemeComponent implements OnInit {
   isDarkTheme: boolean;
   public userType = USER_TYPES;
   constructor(private generalService: GeneralService, public authService: AuthenticationService) {}

   ngOnInit() {
      // this.isDarkTheme = this.authService.currentUserValue ? !!this.authService.currentUserValue.darkTheme : false;
      this.generalService.getDarkTheme().subscribe(darkTheme => {
         this.isDarkTheme = darkTheme;
      });
   }
   mostrar(event) {
      console.log(event);
   }

   toggleDarkTheme(checked: boolean) {
      this.generalService.setDarkTheme(checked);
   }
}
