import { FilesComponent } from './files/files.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CoursesComponent } from './courses/courses.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'archivos'
  },
  // {
  //   path: 'carreras',
  //   component: CareersComponent,
  // },
  {
    path: 'materias',
    component: CoursesComponent,
  },
  {
    path: 'archivos',
    component: FilesComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
