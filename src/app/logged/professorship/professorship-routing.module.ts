import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FileManagementComponent } from './file-management/file-management.component';


const routes: Routes = [
  {
    path: "archivos",
    component: FileManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfessorshipRoutingModule { }
