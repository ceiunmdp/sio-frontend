import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { OrdersService } from "src/app/logged/orders/orders.service";
import { GeneralService } from "src/app/_services/general.service";
import { Routes } from "src/app/_routes/routes";
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from "@angular/material";
import {Order} from "src/app/_models/orders/order";
import { ORDER_STATES } from "src/app/_orderStates/states";
import {finalize} from "rxjs/operators";

// Bottom sheet component
@Component({
   selector: "bottom-sheet-files",
   templateUrl: "bottom-sheet-files.html",
   styleUrls: ["./order-detail.component.scss"]
})
export class BottomSheetFiles implements OnInit {
  ringedGroups: any[];
  isLoadingOrderDetail = true;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<BottomSheetFiles>,
    private orderService: OrdersService,
    private cd: ChangeDetectorRef,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}

  ngOnInit() {
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
}

@Component({
   selector: "cei-order-detail",
   templateUrl: "./order-detail.component.html",
   styleUrls: ["./order-detail.component.scss"]
})
export class OrderDetailComponent implements OnInit {
   order: Order;
   orderId: any;
   routes = Routes;
   ORDER_STATES = ORDER_STATES;
   isLoadingGetOrders = false;

   @ViewChild("orderCancelSwal", { static: true }) orderCancelSwal;
   constructor(
      public generalService: GeneralService,
      public orderService: OrdersService,
      private route: ActivatedRoute,
      public router: Router,
      private _bottomSheet: MatBottomSheet
   ) {
      this.order = router.getCurrentNavigation().extras.state ? router.getCurrentNavigation().extras.state.order : null;
   }

   ngOnInit() {
      this.orderId = this.route.snapshot.paramMap.get("order-id");
      if(!this.order){
        this.isLoadingGetOrders = true;
        this.orderService.getOrderById(this.orderId).pipe(
          finalize(() => this.isLoadingGetOrders = false)
        )
          .subscribe(order => {
            this.order = this.sortTracking(order);
            this.generalService.sendMessage({ title: `Detalles del pedido` });
          });
      } else{
        this.order = this.sortTracking(this.order);
      }
   }

   sortTracking(order:Order): Order {
     order.tracking.sort((previousTrack, actualTrack) => {
      const previousTrackMs = new Date(previousTrack.timestamp.toString()).getMilliseconds();
      const actualTrackMs = new Date(actualTrack.timestamp.toString()).getMilliseconds();
      return previousTrackMs - actualTrackMs;
     })
     return order
   }

   doCancel() {
    const body = {
      state: {
        code: this.ORDER_STATES.CANCELADO
      }
    }; 
    this.orderService.patchOrder(body,this.order.id).subscribe(message => {
        this.orderCancelSwal.fire();
    });
   }

   openBottomSheet(): void {
      this._bottomSheet.open(BottomSheetFiles, { data: this.order });
   }
}
