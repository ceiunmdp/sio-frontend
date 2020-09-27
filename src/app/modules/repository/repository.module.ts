import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { FilesComponent } from './components/files/files.component';
import { RepositoryComponent } from './pages/repository/repository.component';
import { MaterialModule } from 'src/app/material/material.module';
import { UtilsModule } from 'src/app/_utils/utils.module';
import { RepositoryRoutingModule } from './repository-routing.module';



@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    UtilsModule,
    RepositoryRoutingModule
  ],
  declarations: [ToolbarComponent, FilesComponent, RepositoryComponent]
})
export class RepositoryModule { }
