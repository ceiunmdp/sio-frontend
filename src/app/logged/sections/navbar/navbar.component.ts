import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "src/app/_models/users/user";
import { Routes } from "src/app/_routes/routes";
import { MenuItems } from "src/app/_menu-items/menuItems";
import { GeneralService } from "src/app/_services/general.service";
import { AuthenticationService } from "../../../_services/authentication.service";
import { HttpErrorResponseHandlerService } from "./../../../_services/http-error-response-handler.service";
import { Observable } from "rxjs";
import { Functionality } from 'src/app/_models/menu/functionality';

@Component({
   selector: "cei-navbar",
   templateUrl: "./navbar.component.html",
   styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit {
   user: User;
   menu: Functionality;
   routes = Routes; // Necessary for the view
   menuItems = MenuItems;
   isDarkTheme$: Observable<boolean>;

   constructor(
      private generalService: GeneralService,
      public authService: AuthenticationService,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,
      private router: Router
   ) { }

   ngOnInit() {
      console.log(MenuItems.ACTIVE_ORDERS);
      this.isDarkTheme$ = this.generalService.getDarkTheme();

      this.user = this.authService.currentUserValue;
      //this.getMenu();
   }

   getMenu() {
      this.generalService.getMenu().subscribe(
         (modulee: Functionality) => {
            console.log(modulee);

            this.menu = modulee;
         },
         (error: HttpErrorResponse) => {
            this.httpErrorResponseHandlerService.handleError(this.router, error);
         }
      );
   }

   logout() {
      this.authService.logout().subscribe(
         () => {
            this.authService.removeCurrentUser();
            this.router.navigate([Routes.LOGIN]);
         },
         (error: HttpErrorResponse) => {
            this.authService.removeCurrentUser();
            this.router.navigate([Routes.LOGIN]);
         }
      );
   }
}
