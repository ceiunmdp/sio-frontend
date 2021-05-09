import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/_services/general.service";
import { Order } from "src/app/_models/orders/order";
import { OrdersService } from "../../orders/orders.service";
import { Routes } from "src/app/_routes/routes";
import { AuthenticationService } from "src/app/_services/authentication.service";

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

   constructor(public orderService: OrdersService, public authService: AuthenticationService) {}

   ngOnInit() {
      for (let i = 0; i < 4; i++) {
         this.pedidos.push({
            nombre: "Pedido n°" + i.toString(),
            estado: "Completado"
         });
      }
      this.getActiveOrders();
   }

   private getActiveOrders() {
      this.orderService.getOrders().subscribe(orders => {
         this.orders = orders;
         // console.log(this.orders);
      });
   }
}
