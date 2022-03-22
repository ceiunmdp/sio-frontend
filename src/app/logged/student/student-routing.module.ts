import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovementsComponent } from '../../shared/movements/movements/movements.component';
import {HomeEstudianteComponent} from './home-estudiante/home-estudiante.component';
import { MoneyTransferComponent } from './money-transfer/money-transfer.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'home'
  },
  {
    path: "home",
    component: HomeEstudianteComponent
  },
  {
    path: "transferencia",
    component: MoneyTransferComponent
  },
  {
    path: "movimientos",
    component: MovementsComponent
  },
  {
    path: "pedidos",
    loadChildren: () => import("./orders/orders.module").then(mod => mod.OrdersModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StudentRoutingModule { }
