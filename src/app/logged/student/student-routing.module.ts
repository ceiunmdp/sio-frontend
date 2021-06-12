import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovementsComponent } from '../../shared/movements/movements/movements.component';
import { MoneyTransferComponent } from './money-transfer/money-transfer.component';


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
