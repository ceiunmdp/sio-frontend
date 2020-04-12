import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule, MatCardModule, MatDividerModule, MatIconModule, MatListModule } from '@angular/material';
import { UtilsModule } from 'src/app/_utils/utils.module';
import { HomeEstudianteComponent } from './home-estudiante/home-estudiante.component';
import { HomeRoutingModule } from './home-routing.module';
import { HomeSedeComponent } from './home-sede/home-sede.component';
import { HomeComponent } from './home/home.component';

@NgModule({
   declarations: [HomeEstudianteComponent, HomeSedeComponent, HomeComponent],
   imports: [
      CommonModule,
      UtilsModule,
      HomeRoutingModule,
      MatButtonModule,
      MatCardModule,
      MatDividerModule,
      MatListModule,
      MatIconModule,
      FlexLayoutModule
   ]
})
export class HomeModule {}
