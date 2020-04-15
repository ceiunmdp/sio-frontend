import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { NewOrderComponent } from "./new-order/new-order.component";
import { MyOrdersComponent } from "./my-orders/my-orders.component";
import { OrderDetailComponent } from "./order-detail/order-detail.component";
import { RoleGuard } from "src/app/_auth/role.guard";
import { Roles } from "src/app/_roles/roles";

const routes: Routes = [
   {
      path: "",
      redirectTo: "nuevo-pedido"
   },
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
export class OrderRoutingModule {}