import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/_services/general.service";
import { Order } from "src/app/_models/orders/order";
import { OrdersService } from "../../orders/orders.service";
import { Routes } from "src/app/_routes/routes";
import { AuthenticationService } from "src/app/_services/authentication.service";
import {FilterBuilder, OPERATORS} from "src/app/_helpers/filterBuilder";
import {finalize} from "rxjs/operators";
import {Pagination} from "src/app/_models/pagination";
import {Sort} from "@angular/material";

interface Pedido {
   nombre: string;
   estado: string;
}

@Component({
   selector: "cei-home-estudiante",
   templateUrl: "./home-estudiante.component.html",
   styleUrls: ["./home-estudiante.component.scss"]
})
export class HomeEstudianteComponent implements OnInit {
   pedidos: Pedido[] = [];
   displayedColumns: string[] = ["nombre", "estado"];
   orders: Order[] = [];
   routes = Routes;
   fb: FilterBuilder = new FilterBuilder();
   isLoadingGetOrders = false;

   constructor(public orderService: OrdersService, public authService: AuthenticationService) {}

   ngOnInit() {
      // for (let i = 0; i < 4; i++) {
      //    this.pedidos.push({
      //       nombre: "Pedido n°" + i.toString(),
      //       estado: "Completado"
      //    });
      // }
      this.getActiveOrders();
   }

   getActiveOrders(sort?: Sort[], pagination?: Pagination) {
    this.isLoadingGetOrders = true;
    const filter = this.fb.and(
      this.fb.or(
        // TODO: poner resto de condiciones
        this.fb.where('state.code', OPERATORS.IS, 'requested'),
        // fb.where('state.code', OPERATORS.IS, 'in_process'),
        // fb.where('state.code', OPERATORS.IS, 'ready')
      )
    );
    this.orderService.getMyOrders(filter, null, pagination).pipe(
      finalize(() => { this.isLoadingGetOrders = false })
    ).subscribe( (data) => { this.orders = data.data.items })
  }

  //  private getActiveOrders() {
  //     this.orderService.getOrders().subscribe(orders => {
  //        this.orders = orders;
  //        // console.log(this.orders);
  //     });
  //  }
}
