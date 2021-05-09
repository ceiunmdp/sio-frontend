import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { OrdersService } from "src/app/logged/orders/orders.service";
import { GeneralService } from "src/app/_services/general.service";
import { Routes } from "src/app/_routes/routes";
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from "@angular/material";
import {Order} from "src/app/_models/orders/order";
import { ORDER_STATES } from "src/app/_orderStates/states";

// Bottom sheet component
@Component({
   selector: "bottom-sheet-files",
   templateUrl: "bottom-sheet-files.html",
   styleUrls: ["./order-detail.component.scss"]
})
export class BottomSheetFiles implements OnInit {
  ringedGroups: any[];

   constructor(
      private _bottomSheetRef: MatBottomSheetRef<BottomSheetFiles>,
      @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
   ) {
      console.log(data);
   }

   ngOnInit() {
      this.ringedGroups = this.createRingedGroups();
      console.log(this.ringedGroups);
   }

   openLink(event: MouseEvent): void {
      this._bottomSheetRef.dismiss();
      event.preventDefault();
   }

   createRingedGroups() {
      const ringedGroups = [];
      const orderFiles: any[] = this.data.orderFiles;
      let indexPushed;
      orderFiles.forEach(order => {
         /** *
          * TODO: Debería preguntar por ringedGroup, pero me manda objeto con atr nulos,
          * en vez de mandar el obj como nulo
          * */
         if (!!order.configuration.ringedOrder) {
            console.log("Configuracion del archivo: ", order);
            const ringed = ringedGroups.find(ring => {
               console.log(ring.id, "vs", order.configuration.ringedGroup.id);
               return ring.id == order.configuration.ringedGroup.id;
            });
            console.log("Anillado encontrado: ", ringed);

            // Si no existe el anillado, lo inserto
            if (!ringed) {
               indexPushed = ringedGroups.push({
                  id: order.configuration.ringedGroup.id,
                  price: order.configuration.ringedGroup.price,
                  name: order.configuration.ringedGroup.item.name,
                  files: []
               });
               ringedGroups[indexPushed - 1].files[order.configuration.ringedOrder - 1] = {
                  name: order.file.name,
                  course: order.file.course.name
               };
               console.log("Se creo el siguiente anillado: ", ringedGroups[0]);
            }
            // Si ya existe, inserto el archivo en el order correspondiente.
            else {
               ringed.files[order.configuration.ringedOrder - 1] = {
                  name: order.file.name,
                  course: order.file.course.name
               };
               console.log("Se insertó un archivo en el anillado ", ringed);
            }
         }
         console.log("Anillados parciales: ", ringedGroups);
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
        this.orderService.getOrderById(this.orderId).subscribe(order => {
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
