import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { UtilsModule } from 'src/app/_utils/utils.module';
import { MaterialModule } from './../../material/material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgSelectConfig } from '@ng-select/ng-select';
import { ɵs } from '@ng-select/ng-select';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
import { AdminRoutingModule } from './admin-routing.module';
import { FilesComponent } from './files/files.component';
import { CoursesComponent } from './courses/courses.component';
import { CreateEditCourseComponent } from './courses/create-edit-course/create-edit-course.component';
import { FormsModule } from '@angular/forms';
import { CareersComponent } from './careers/careers.component';
import { CreateEditCareerComponent } from './careers/create-edit-career/create-edit-career.component';
import { ItemsComponent } from './items/items.component';
import { EditItemComponent } from './items/edit-item/edit-item.component';
import { BindingsComponent } from './bindings/bindings.component';
import { CreateEditBindingsComponent } from './bindings/create-edit-bindings/create-edit-bindings.component';
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginFileEncode);

@NgModule({
  declarations: [FilesComponent, CoursesComponent, CreateEditCourseComponent, CareersComponent, CreateEditCareerComponent, ItemsComponent, EditItemComponent, BindingsComponent, CreateEditBindingsComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MaterialModule,
    FormsModule,
    UtilsModule,
    NgSelectModule,
    SweetAlert2Module.forRoot()
  ],
  providers: [
    NgSelectConfig,
    ɵs
  ]
})
export class AdminModule { }
