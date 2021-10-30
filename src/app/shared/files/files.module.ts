import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditFileComponent } from './edit-file/edit-file.component';
import { MaterialModule } from 'src/app/material/material.module';
import {FilesComponent} from 'src/app/shared/files/files/files.component';
import {NgSelectModule} from '@ng-select/ng-select';
import { NgSelectConfig } from '@ng-select/ng-select';
import { ɵs } from '@ng-select/ng-select';
import {LottieModule} from 'ngx-lottie';
import player from 'lottie-web';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import { registerPlugin } from 'ngx-filepond';
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginFileEncode);
@NgModule({
  declarations: [FilesComponent, EditFileComponent],
  imports: [
    CommonModule,
    MaterialModule,
    NgSelectModule,
    LottieModule.forRoot({ player: () => player })
  ],
  providers: [
    NgSelectConfig,
    ɵs
  ],
  exports: [
    EditFileComponent,
    FilesComponent
  ]
})
export class FilesModule { }
