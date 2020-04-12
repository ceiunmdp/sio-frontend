import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { OrdersService } from "src/app/logged/orders/orders.service";
import { Order } from "src/app/_models/orders/order";
import { GeneralService } from "src/app/_services/general.service";
import { Routes } from "src/app/_routes/routes";
import { MatBottomSheet, MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from "@angular/material";

// Bottom sheet component
@Component({
   selector: "bottom-sheet-files",
   templateUrl: "bottom-sheet-files.html",
   styleUrls: ["./order-detail.component.scss"]
})
export class BottomSheetFiles implements OnInit {
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

   ringedGroups: any[];

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
   routes = Routes; // Necessary for the view

   @ViewChild("orderCancelSwal", { static: true }) orderCancelSwal;
   constructor(
      public generalService: GeneralService,
      public orderService: OrdersService,
      private route: ActivatedRoute,
      public router: Router,
      private _bottomSheet: MatBottomSheet
   ) {
      console.log(router.getCurrentNavigation().extras.state);
      this.order = router.getCurrentNavigation().extras.state ? router.getCurrentNavigation().extras.state.order : null;
   }

   ngOnInit() {
      this.orderId = this.route.snapshot.paramMap.get("order-id");
      this.order
         ? null
         : this.orderService.getOrderById(this.orderId).subscribe(order => {
              this.order = order;
              // this.generalService.sendMessage({ title: `Pedido #${this.order.id}` });
              this.generalService.sendMessage({ title: `Detalles del pedido` });
           });
   }

   doCancel() {
      this.orderService.cancelOrderById(this.order.id).subscribe(message => {
         console.log(message);
         this.orderCancelSwal.fire();
         // this.router.navigate(['cei/home/mis-pedidos']);
      });
   }

   openBottomSheet(): void {
      console.log(this.order);
      this._bottomSheet.open(BottomSheetFiles, { data: this.order });
   }
}
