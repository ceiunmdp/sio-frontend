import { Component, OnInit } from "@angular/core";
import { Sort } from "@angular/material";
import { finalize } from "rxjs/operators";
import { FilterBuilder, OPERATORS } from "src/app/_helpers/filterBuilder";
import { Order } from "src/app/_models/orders/order";
import { Pagination } from "src/app/_models/pagination";
import { Routes } from "src/app/_routes/routes";
import { AuthenticationService } from "src/app/_services/authentication.service";
import { USER_TYPES } from "src/app/_users/types";
import { OrdersService } from "../orders/orders.service";
import {AnimationOptions} from 'ngx-lottie';
import {GeneralService} from 'src/app/_services/general.service';

@Component({
   selector: "cei-home-estudiante",
   templateUrl: "./home-estudiante.component.html",
   styleUrls: ["./home-estudiante.component.scss"]
})
export class HomeEstudianteComponent implements OnInit {
   displayedColumns: string[] = ["nombre", "estado"];
   orders: Order[] = [];
   routes = Routes;
   fb: FilterBuilder = new FilterBuilder();
   isLoadingGetOrders = false;
   rootPath: string;
   public userType = USER_TYPES;
   noOrdersLottie: AnimationOptions = {
     path: 'assets/animations/empty-2.json',
     loop: false
   };

   constructor(public orderService: OrdersService, public authService: AuthenticationService, private generalService: GeneralService) {}

   ngOnInit() {
      this.getActiveOrders();
      this.rootPath = this.authService.currentUserValue.rootPath;
      this.generalService.sendMessage({title: 'Home'});
   }

   getActiveOrders(sort?: Sort[], pagination?: Pagination) {
    this.isLoadingGetOrders = true;
    const filter = this.fb.and(
        this.fb.where('state.code', OPERATORS.IN, ['requested', 'in_process', 'ready'])
    );
    this.orderService.getMyOrders(filter, null, pagination).pipe(
      finalize(() => { this.isLoadingGetOrders = false })
    ).subscribe( (data) => { this.orders = data.data.items })
  }

}
