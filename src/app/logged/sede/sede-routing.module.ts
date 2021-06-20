import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MovementsComponent } from "../../shared/movements/movements/movements.component";
import { ChargeBalanceComponent } from "./charge-balance/charge-balance.component";
import { HistoricOrdersComponent } from "./historic-orders/historic-orders.component";
import { OrdersComponent } from "./orders/orders.component";

const routes: Routes = [
   {
      path: "",
      redirectTo: "pedidos"
   },
   {
      path: "pedidos",
      component: OrdersComponent
   },
   {
      path: "pedidos-historicos",
      component: HistoricOrdersComponent
   },
   {
      path: "estudiantes",
      component: ChargeBalanceComponent
   },
   {
      path: "movimientos",
      component: MovementsComponent
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class SedeRoutingModule {}
