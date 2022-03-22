import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleGuard } from "../_auth/role.guard";
import { Roles } from "../_roles/roles";
import {AuthenticationService} from "../_services/authentication.service";
import { LoggedComponent } from "./logged.component";

const loggedRoutes: Routes = [
   {
      path: "",
      component: LoggedComponent,
      // Protect all other child routes at one time instead of adding the AuthGuard to each route individually.
      // canActivateChild: [AuthGuard],
      children: [
         {
            path: "",
            redirectTo: "main",
         },
         {
            path: "main",
            loadChildren: () => import("./main/main.module").then(mod => mod.MainModule),
         },
         {
            path: "sede",
            loadChildren: () => import("./sede/sede.module").then(mod => mod.SedeModule),
            canLoad: [RoleGuard],
            data: { expectedRoles: [Roles.Sede] }
         },
         {
            path: "admin",
            loadChildren: () => import("./admin/admin.module").then(mod => mod.AdminModule),
            canLoad: [RoleGuard],
            data: { expectedRoles: [Roles.Admin], breadcumb: 'Admin' }
         },
         {
            path: "catedra",
            loadChildren: () => import("./professorship/professorship.module").then(mod => mod.ProfessorshipModule),
            canActivate: [RoleGuard],
            data: { expectedRoles: [Roles.Catedra], breadcumb: 'Catedra' }
         },
         {
            path: "estudiante",
            loadChildren: () => import("./student/student.module").then(mod => mod.StudentModule),
            canActivate: [RoleGuard],
            data: { expectedRoles: [Roles.Estudiante, Roles.Becado], breadcumb: 'Estudiante' }
         }
      ]
   }
];

@NgModule({
   imports: [RouterModule.forChild(loggedRoutes)],
   exports: [RouterModule]
})
export class LoggedRoutingModule {}
