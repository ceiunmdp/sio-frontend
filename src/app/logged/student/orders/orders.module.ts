import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
   MatFormFieldModule,
   MatInputModule,
   MatTableModule,
   MatTooltipModule,
   MatMenuModule,
   MatSortModule,
   MatPaginatorModule,
   MatProgressSpinnerModule,
   MatProgressBarModule
} from "@angular/material";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTreeModule } from "@angular/material/tree";
import { FormRulesModule } from "ng-form-rules";
import { UtilsModule } from "src/app/_utils/utils.module";
import { OrderRoutingModule } from "./orders-routing.module";
import { SnackbarComponent } from "./snackbar/snackbar.component";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { MatDividerModule } from "@angular/material/divider";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { FilesComponent } from './components/files/files.component';
import { NewOrderComponent } from './pages/new-order/new-order.component';
import { FilesConfigComponent } from './components/files-config/files-config.component';
import { RingConfigComponent } from './components/ring-config/ring-config.component';
import { ConfirmOrderComponent } from './components/confirm-order/confirm-order.component';
import {MyOrdersComponent} from "./pages/my-orders/my-orders.component";
import {BottomSheetFiles, OrderDetailComponent} from "./components/order-detail/order-detail.component";
import {LottieModule} from 'ngx-lottie';
import player from 'lottie-web';
export function playerFunction () { return player; }

@NgModule({
   declarations: [
      NewOrderComponent,
      OrderDetailComponent,
      SnackbarComponent,
      FilesConfigComponent,
      BottomSheetFiles,
      FilesComponent,
      RingConfigComponent,
      ConfirmOrderComponent,
      MyOrdersComponent
   ],
   imports: [
      CommonModule,
      FormRulesModule,
      MatExpansionModule,
      MatButtonModule,
      MatTableModule,
      MatProgressSpinnerModule,
      MatProgressBarModule,
      MatSlideToggleModule,
      MatCheckboxModule,
      FlexLayoutModule,
      MatToolbarModule,
      MatIconModule,
      MatCardModule,
      MatDialogModule,
      MatListModule,
      OrderRoutingModule,
      MatTabsModule,
      MatTreeModule,
      MatSnackBarModule,
      MatFormFieldModule,
      MatStepperModule,
      MatInputModule,
      MatTooltipModule,
      FormsModule,
      MatSelectModule,
      ReactiveFormsModule,
      UtilsModule,
      MatDividerModule,
      MatSortModule,
      MatPaginatorModule,
      MatMenuModule,
      DragDropModule,
      SweetAlert2Module.forRoot(),
      LottieModule.forRoot({ player: playerFunction }),
   ],
   exports: [NewOrderComponent, MyOrdersComponent, OrderDetailComponent],
   entryComponents: [SnackbarComponent, BottomSheetFiles]
})
export class OrdersModule { }
