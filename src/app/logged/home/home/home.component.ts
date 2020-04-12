import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/_services/general.service";
import { OrdersService } from "../../orders/orders.service";
import { Order } from "src/app/_models/orders/order";
import { AuthenticationService } from "src/app/_services/authentication.service";
import { Subscription } from "rxjs";
import { User } from "src/app/_models/users/user";
import { USER_TYPES } from "src/app/_users/types";
@Component({
   selector: "cei-home",
   templateUrl: "./home.component.html",
   styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
   public readonly TITLE = "Inicio";
   public user: User;
   public userType = USER_TYPES;

   constructor(private generalService: GeneralService, private authService: AuthenticationService) {}

   ngOnInit() {
      this.generalService.sendMessage({ title: this.TITLE });
      this.user = this.authService.currentUserValue;
      console.log(this.user);
   }
}
