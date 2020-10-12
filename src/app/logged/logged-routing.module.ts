import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { Roles } from "../_roles/roles";
import { BalanceComponent } from "./balance/balance.component";
import { LoggedComponent } from "./logged.component";
import { MovementsComponent } from "./movements/movements.component";
import { AuthGuard } from "../_auth/auth.guard";
import { RoleGuard } from "../_auth/role.guard";

const loggedRoutes: Routes = [
   {
      path: "",
      // redirectTo: "",
      component: LoggedComponent,
      // Protect all other child routes at one time instead of adding the AuthGuard to each route individually.
      canActivateChild: [AuthGuard],
      children: [
         {
            path: "",
         //    // Una vez validado el home, debe rederigir a /app/principal.
            //redirectTo: "admin",
         //    // loadChildren: () => import("./home/home.module").then(mod => mod.HomeModule)

         //    // loadChildren: () =>
         //    //    import('./../../modules/cases/cases.module').then((mod) => mod.CasesModule),
            canActivate: [RoleGuard],
         },
         {
            path: "home",
            loadChildren: () => import("./home/home.module").then(mod => mod.HomeModule)
            // canActivate: [RoleGuard],
         },
         {
            path: "movimientos",
            component: MovementsComponent
            // canActivate: [RoleGuard],
         },
         {
            path: "cargar-saldo",
            component: BalanceComponent,
            canActivate: [RoleGuard],
            data: { expectedRoles: [Roles.Sede] }
         },
         {
            path: "pedidos",
            loadChildren: () => import("./orders/orders.module").then(mod => mod.OrdersModule),
            canLoad: [RoleGuard],
            data: { expectedRoles: [Roles.Admin, Roles.Estudiante, Roles.Becado, Roles.Sede] }
         },
         {
            path: "sede",
            loadChildren: () => import("./sede/sede.module").then(mod => mod.SedeModule),
            canLoad: [RoleGuard],
            data: { expectedRoles: [Roles.Sede] }
            // ¿Preload de este módulo?
         },
         {
            path: "admin",
            loadChildren: () => import("./admin/admin.module").then(mod => mod.AdminModule),
            canLoad: [RoleGuard],
            data: { expectedRoles: [Roles.Admin] }
         }
      ]
   }
];

@NgModule({
   imports: [RouterModule.forChild(loggedRoutes)],
   exports: [RouterModule]
})
export class LoggedRoutingModule { }
