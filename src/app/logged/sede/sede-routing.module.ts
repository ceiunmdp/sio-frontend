import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { OrdersComponent } from "./orders/orders.component";
import { ChargeBalanceComponent } from "./charge-balance/charge-balance.component";
import { HistoricOrdersComponent } from "./historic-orders/historic-orders.component";

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
      path: "pedidos-historico",
      component: HistoricOrdersComponent
   },
   {
      path: "estudiantes",
      component: ChargeBalanceComponent
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class SedeRoutingModule {}
