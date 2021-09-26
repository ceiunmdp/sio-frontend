import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatBottomSheet, MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { finalize } from "rxjs/operators";
import { OrdersService } from "src/app/logged/student/orders/orders.service";
import { Order } from "src/app/_models/orders/order";
import { ORDER_STATES } from "src/app/_orderStates/states";
import { Routes } from "src/app/_routes/routes";
import { AuthenticationService } from "src/app/_services/authentication.service";
import { GeneralService } from "src/app/_services/general.service";
import { HttpErrorResponseHandlerService } from "src/app/_services/http-error-response-handler.service";
import Swal from 'sweetalert2';

// Bottom sheet component
@Component({
   selector: "bottom-sheet-files",
   templateUrl: "bottom-sheet-files.html",
   styleUrls: ["./order-detail.component.scss"]
})
export class BottomSheetFiles implements OnInit {
  ringedGroups: any[];
  isLoadingOrderDetail = true;
  rootPath: string;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  constructor(
    public router: Router,
    private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,
    private _bottomSheetRef: MatBottomSheetRef<BottomSheetFiles>,
    private orderService: OrdersService,
    private cd: ChangeDetectorRef,
    private authService: AuthenticationService,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}

  ngOnInit() {
    this.rootPath = this.authService.currentUserValue.rootPath;
    this.getOrderDetail()
      .then(orderFiles => {
        this.ringedGroups = this.createRingedGroups(orderFiles);
        const orderFilesAgrouped = this.agroupConfigurations(orderFiles);
        this.data = {...this.data, orderFiles: orderFilesAgrouped};
        this.cd.detectChanges();
      });
  }

  getOrderDetail(){
    this.isLoadingOrderDetail = true;
    return this.orderService.getOrderFiles(this.data.id).toPromise()
      .then(data => data.items)
      .catch(err => { this.handleErrors(err); this.isLoadingOrderDetail = false })
      .finally(() => this.isLoadingOrderDetail = false);
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  agroupConfigurations (orderFiles) {
    return orderFiles.reduce((arrayOrderFiles:any[], orderFile) => {
      const index = arrayOrderFiles.findIndex(_orderFile => _orderFile.configuration.id == orderFile.configuration.id)
      if(index === -1){
        arrayOrderFiles.push({...orderFile, quantity: 1});
      } else {
        arrayOrderFiles[index].quantity ++;
      }
      return arrayOrderFiles;
    }, []);
  }

  createRingedGroups(orderFiles) {
    const ringedGroups = [];
    let indexPushed;
    orderFiles.forEach(order => {
      if (!!order.binding_group) {
        const ringed = ringedGroups.find(ring => {
            return ring.id == order.binding_group.id;
        });
        // Si no existe el anillado, lo inserto
        if (!ringed) {
            indexPushed = ringedGroups.push({
              id: order.binding_group.id,
              price: order.binding_group.price,
              name: order.binding_group.name,
              files: []
            });
            ringedGroups[indexPushed - 1].files[order.position - 1] = order.file.name;
        }
        // Si ya existe, inserto el archivo en el order correspondiente.
        else {
          ringed.files.push(order.file.name);
          ringed.files[order.position - 1] = order.file.name;
        }
      }
    });
    return ringedGroups;
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }
}

@Component({
   selector: "cei-order-detail",
   templateUrl: "./order-detail.component.html",
   styleUrls: ["./order-detail.component.scss"]
})
export class OrderDetailComponent implements OnInit {
   order: Order;
   historicOrdersShow: boolean;
   orderId: any;
   routes = Routes;
   rootPath: string;
   ORDER_STATES = ORDER_STATES;
   isLoadingGetOrders = false;
   @ViewChild('alertError', { static: true }) alertError;
   messageError: string;

   @ViewChild("orderCancelSwal", { static: true }) orderCancelSwal;
   constructor(
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,
      public generalService: GeneralService,
      public orderService: OrdersService,
      public authService: AuthenticationService,
      private route: ActivatedRoute,
      public router: Router,
      private _bottomSheet: MatBottomSheet
   ) {
      this.order = router.getCurrentNavigation().extras.state ? router.getCurrentNavigation().extras.state.order : null;
      this.historicOrdersShow = this.router.getCurrentNavigation().extras.state ? this.router.getCurrentNavigation().extras.state.historicOrdersShow : null;
   }

   ngOnInit() {
      this.rootPath = this.authService.currentUserValue.rootPath;
      this.orderId = this.route.snapshot.paramMap.get("order-id");
      this.getOrder();
   }

   getOrder(forceGet = false) {
      if (forceGet || !this.order) {
        this.isLoadingGetOrders = true;
        this.orderService.getOrderById(this.orderId).pipe(
          finalize(() => this.isLoadingGetOrders = false)
        )
          .subscribe(order => {
            this.order = this.sortTracking(order);
            this.generalService.sendMessage({ title: `Detalles del pedido` });
          }, err => { this.handleErrors(err); this.isLoadingGetOrders = false });
      } else {
        this.order = this.sortTracking(this.order);
      }
   }

   onClickReturn() {
     this.router.navigate([`${this.rootPath}/pedidos/mis-pedidos`],
     { state: { historicOrdersShow: this.historicOrdersShow  } });
   }

   sortTracking(order:Order): Order {
     order.tracking.sort((previousTrack, actualTrack) => {
      const previousTrackMs = new Date(previousTrack.timestamp.toString()).getTime();
      const actualTrackMs = new Date(actualTrack.timestamp.toString()).getTime();
      return previousTrackMs - actualTrackMs;
     })
     console.log(order);
     return order
   }

   onCancel() {
      Swal.fire({
        title: 'Cancelar pedido',
        text: `¿Seguro desea cancelar el pedido?`,
        icon: 'question',
        showConfirmButton: true,
        showCancelButton: true,
        reverseButtons: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: () => {
          return this.doCancel()
            .then(() => this.getOrder(true));
        },
        allowOutsideClick: () => !Swal.isLoading()
      })
   }

   doCancel() {
    const body = {
      state: {
        code: this.ORDER_STATES.CANCELADO
      }
    };
    return this.orderService.patchOrder(body, this.order.id).toPromise()
      .then(message => {
        this.orderCancelSwal.fire();
      })
      .catch(err => this.handleErrors(err));
   }

   openBottomSheet(): void {
      this._bottomSheet.open(BottomSheetFiles, { data: this.order });
   }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }
}
