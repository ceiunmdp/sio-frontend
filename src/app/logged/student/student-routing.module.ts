import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MoneyTransferComponent } from './money-transfer/money-transfer.component';
import { MovementsComponent } from './movements/movements.component';


const routes: Routes = [
  {
    path: "transferencia",
    component: MoneyTransferComponent
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
export class StudentRoutingModule { }
