import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MaterialModule } from 'src/app/material/material.module';
import { MovementsModule } from 'src/app/shared/movements/movements.module';
import { UtilsModule } from 'src/app/_utils/utils.module';
import {HomeEstudianteComponent} from './home-estudiante/home-estudiante.component';
import { BottomMoneyTransferComponent, MoneyTransferComponent } from './money-transfer/money-transfer.component';
import {OrdersModule} from './orders/orders.module';
import { StudentRoutingModule } from './student-routing.module';



@NgModule({
  declarations: [
    MoneyTransferComponent,
    BottomMoneyTransferComponent,
    HomeEstudianteComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MovementsModule,
    FormsModule,
    UtilsModule,
    MatIconModule,
    SweetAlert2Module.forRoot(),
    StudentRoutingModule
  ],
  entryComponents: [BottomMoneyTransferComponent]
})
export class StudentModule { }
