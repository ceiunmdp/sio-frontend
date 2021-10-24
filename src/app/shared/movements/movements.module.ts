import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { MaterialModule } from 'src/app/material/material.module';
import { UtilsModule } from 'src/app/_utils/utils.module';
import { MovementsComponent } from './movements/movements.component';
import player from 'lottie-web';
import {LottieModule} from 'ngx-lottie';


@NgModule({
  declarations: [MovementsComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    UtilsModule,
    MatIconModule,
    SweetAlert2Module.forRoot(),
    LottieModule.forRoot({ player: () => player })
  ],
  exports: [MovementsComponent]
})
export class MovementsModule { }
