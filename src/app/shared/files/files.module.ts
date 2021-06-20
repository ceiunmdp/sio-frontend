import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditFileComponent } from './edit-file/edit-file.component';
import { MaterialModule } from 'src/app/material/material.module';



@NgModule({
  declarations: [EditFileComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    EditFileComponent
  ]
})
export class FilesModule { }
