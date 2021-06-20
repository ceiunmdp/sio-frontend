import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FlexLayoutModule} from "@angular/flex-layout";
import {ReactiveFormsModule} from "@angular/forms";
import {MatIconModule, MatInputModule, MatMenuModule, MatPaginatorModule, MatProgressSpinnerModule, MatSortModule} from "@angular/material";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatListModule} from "@angular/material/list";
import {MatTableModule} from "@angular/material/table";
import {SweetAlert2Module} from "@sweetalert2/ngx-sweetalert2";
import {MovementsModule} from "src/app/shared/movements/movements.module";
import {UtilsModule} from "src/app/_utils/utils.module";
import {BottomChargeBalance, ChargeBalanceComponent} from "./charge-balance/charge-balance.component";
import {HistoricOrdersComponent} from "./historic-orders/historic-orders.component";
import {BottomSheetFiles, OrdersComponent} from "./orders/orders.component";
import {SedeRoutingModule} from "./sede-routing.module";

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
      MovementsModule,
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
