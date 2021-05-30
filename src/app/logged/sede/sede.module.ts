import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTableModule } from "@angular/material/table";
import { SedeRoutingModule } from "./sede-routing.module";
import { OrdersComponent, BottomSheetFiles } from "./orders/orders.component";
import { ChargeBalanceComponent, BottomChargeBalance } from "./charge-balance/charge-balance.component";
import { UtilsModule } from "src/app/_utils/utils.module";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { ReactiveFormsModule } from "@angular/forms";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { HistoricOrdersComponent } from "./historic-orders/historic-orders.component";
import { MatIconModule, MatPaginatorModule, MatInputModule, MatSortModule, MatMenuModule, MatSpinner, MatProgressSpinnerModule } from "@angular/material";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatListModule } from "@angular/material/list";

@NgModule({
   declarations: [
      OrdersComponent,
      ChargeBalanceComponent,
      BottomChargeBalance,
      HistoricOrdersComponent,
      BottomSheetFiles
   ],
   imports: [
      CommonModule,
      SedeRoutingModule,
      MatTableModule,
      UtilsModule,
      MatButtonModule,
      MatCardModule,
      FlexLayoutModule,
      MatDividerModule,
      ReactiveFormsModule,
      MatIconModule,
      MatExpansionModule,
      MatListModule,
      MatPaginatorModule,
      MatInputModule,
      MatSortModule,
      MatMenuModule,
      MatProgressSpinnerModule,
      SweetAlert2Module.forRoot()
   ],
   entryComponents: [BottomChargeBalance, BottomSheetFiles]
})
export class SedeModule { }
