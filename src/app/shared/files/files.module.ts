import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditFileComponent } from './edit-file/edit-file.component';
import { MaterialModule } from 'src/app/material/material.module';
import {FilesComponent} from 'src/app/shared/files/files/files.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {LottieModule} from 'ngx-lottie';
import player from 'lottie-web';

@NgModule({
  declarations: [FilesComponent, EditFileComponent],
  imports: [
    CommonModule,
    MaterialModule,
    NgSelectModule,
    LottieModule.forRoot({ player: () => player })
  ],
  exports: [
    EditFileComponent,
    FilesComponent
  ]
})
export class FilesModule { }
