import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BindingsComponent } from './bindings/bindings.component';
import { CampusesComponent } from './campuses/campuses.component';
import { CareersComponent } from './careers/careers.component';
import { CoursesComponent } from './courses/courses.component';
import { FilesComponent } from '../../shared/files/files/files.component';
import { ItemsComponent } from './items/items.component';
import { ParametersComponent } from './parameters/parameters.component';
import { UsersComponent } from './users/users.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'usuarios'
  },
  {
    path: 'carreras',
    data: {
      breadcrumb: 'Carreras'
    },
    component: CareersComponent
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
    path: 'anillados',
    data: {
      breadcrumb: 'Anillados'
    },
    component: BindingsComponent,
  },
  {
    path: 'archivos',
    component: FilesComponent,
  },
  {
    path: 'sedes',
    component: CampusesComponent,
  },
  {
    path: 'usuarios',
    component: UsersComponent,
  },
  {
    path: 'parametricas',
    data: {
      breadcrumb: 'Paramétricas'
    },
    component: ParametersComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
