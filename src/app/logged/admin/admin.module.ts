import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { UtilsModule } from 'src/app/_utils/utils.module';
import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilePondModule, registerPlugin } from 'ngx-filepond';

import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import { AdminRoutingModule } from './admin-routing.module';
import { FilesComponent } from './files/files.component';
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginFileEncode);

@NgModule({
  declarations: [FilesComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
    UtilsModule,
    SweetAlert2Module.forRoot()
  ]
})
export class AdminModule { }
