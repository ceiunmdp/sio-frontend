import { ItemsComponent } from './items/items.component';
import { CareersComponent } from './careers/careers.component';
import { FilesComponent } from './files/files.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CoursesComponent } from './courses/courses.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'archivos'
  },
  {
    path: 'carreras',
    data: {
      breadcrumb: 'Carreras'
    },
    component: CareersComponent,

  },
  {
    path: 'materias',
    data: {
      breadcrumb: 'Materias'
    },
    component: CoursesComponent,
  },
  {
    path: 'articulos',
    data: {
      breadcrumb: 'Artículos'
    },
    component: ItemsComponent,
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
