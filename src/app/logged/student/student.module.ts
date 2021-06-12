import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StudentRoutingModule } from './student-routing.module';
import { BottomMoneyTransferComponent, MoneyTransferComponent } from './money-transfer/money-transfer.component';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from 'src/app/_utils/utils.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MatIconModule } from '@angular/material';
import { MovementsComponent } from './movements/movements.component';


@NgModule({
  declarations: [MoneyTransferComponent, BottomMoneyTransferComponent, MovementsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    UtilsModule,
    MatIconModule,
    SweetAlert2Module.forRoot(),
    StudentRoutingModule
  ],
  entryComponents: [BottomMoneyTransferComponent]
})
export class StudentModule { }
