import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfessorshipRoutingModule } from './professorship-routing.module';
import { FileManagementComponent } from './file-management/file-management.component';
import { AdminModule } from '../admin/admin.module';
import { MaterialModule } from 'src/app/material/material.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from 'src/app/_utils/utils.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { FilesModule } from 'src/app/shared/files/files.module';


@NgModule({
  declarations: [FileManagementComponent],
  imports: [
    CommonModule,
    FilesModule,
    MaterialModule,
    FormsModule,
    UtilsModule,
    SweetAlert2Module.forRoot(),
    ProfessorshipRoutingModule
  ]
})
export class ProfessorshipModule { }
