import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepositoryComponent } from './pages/repository/repository.component';

const routes: Routes = [
   {
      path: '',
      component: RepositoryComponent
   }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class RepositoryRoutingModule { }
