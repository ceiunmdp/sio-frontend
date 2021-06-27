import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RoleGuard } from "src/app/_auth/role.guard";
import { Roles } from "src/app/_roles/roles";
import { OrderDetailComponent } from "./components/order-detail/order-detail.component";
import { MyOrdersComponent } from "./pages/my-orders/my-orders.component";
import { NewOrderComponent } from './pages/new-order/new-order.component';

const routes: Routes = [
   {
      path: "",
      redirectTo: "nuevo-pedido"
   },
   // {
   //    path: "nuevo-pedido",
   //    component: NewOrderComponent,
   //    canLoad: [RoleGuard],
   //    data: { expectedRoles: [Roles.Estudiante, Roles.Becado] }
   // },
   {
      path: "nuevo-pedido",
      component: NewOrderComponent,
      canLoad: [RoleGuard],
      data: { expectedRoles: [Roles.Estudiante, Roles.Becado] }
   },
   {
      path: "mis-pedidos",
      component: MyOrdersComponent,
      canLoad: [RoleGuard],
      data: { expectedRoles: [Roles.Estudiante, Roles.Becado] }
   },
   {
      path: "pedido/:order-id",
      component: OrderDetailComponent,
      canLoad: [RoleGuard],
      data: { expectedRoles: [Roles.Estudiante, Roles.Becado] }
   }
   // {
   //     path: 'ver-pedido',
   //     component:
   // }
];

@NgModule({
   imports: [RouterModule.forChild(routes)],
   exports: [RouterModule]
})
export class OrderRoutingModule { }
