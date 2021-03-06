import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MovementsComponent } from "../../shared/movements/movements/movements.component";
import { ChargeBalanceComponent } from "./charge-balance/charge-balance.component";
import {HistoricOrdersComponent} from "./historic-orders/historic-orders.component";
import { HomeSedeComponent } from "./home-sede/home-sede.component";
import { OrdersComponent } from "./orders/orders.component";
import {FilesComponent} from 'src/app/shared/files/files/files.component';

const routes: Routes = [
   {
      path: "",
      redirectTo: "pedidos"
   },
   {
      path: "home",
      component: HomeSedeComponent
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
    path: 'archivos',
    component: FilesComponent,
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
