import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { NotFoundComponent } from "./not-found/not-found.component";
import { AuthGuardUnlogged } from "./_auth/authUnlogged.guard";
import { AuthGuard } from "./_auth/auth.guard";

const appRoutes: Routes = [
   {
      path: "",
      canActivate: [AuthGuardUnlogged],
      redirectTo: "login",
      pathMatch: "full"
   },
   // {
   //    path: "admin",
   //    loadChildren: () => import("./unlogged/unlogged.module").then(mod => mod.UnloggedModule),
   //    canActivate: [AuthGuardUnlogged] // Avoids loading the module if the user is already authenticated
   // },
   {
      path: "login",
      loadChildren: () => import("./unlogged/unlogged.module").then(mod => mod.UnloggedModule),
      canActivate: [AuthGuardUnlogged], // Avoids loading the module if the user is already authenticated
   },
   {
      path: "cei",
      loadChildren: () => import("./logged/logged.module").then(mod => mod.LoggedModule),
      canActivateChild: [AuthGuard], // Avoids loading the module before the user is authenticated
   },
   {
      path: "**",
      redirectTo: "not-found"
   },
   {
      path: "not-found",
      component: NotFoundComponent
   }
];

@NgModule({
   imports: [
      RouterModule.forRoot(appRoutes, {
         enableTracing: false // <-- Debugging purposes only
      })
   ],
   exports: [RouterModule]
})
export class AppRoutingModule { }
