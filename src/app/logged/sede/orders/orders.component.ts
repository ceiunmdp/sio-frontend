import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef } from "@angular/core";
import { GeneralService } from "src/app/_services/general.service";
import {
   MatTableDataSource,
   MatBottomSheetRef,
   MAT_BOTTOM_SHEET_DATA,
   MatBottomSheet,
   MatPaginator,
   MatSort
} from "@angular/material";
import { Order } from "src/app/_models/orders/order";
import { SedeService } from "../sede.service";
import { HttpErrorResponseHandlerService } from "src/app/_services/http-error-response-handler.service";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { OrdersService } from "../../orders/orders.service";
import { ORDER_STATES } from "src/app/_orderStates/states";
import { FILE_STATES } from "src/app/_fileStates/states";
import { RING_STATES } from "src/app/_ringStates/states";
import { OrderCampus } from "src/app/_models/orders/orderCampus";
import { DatePipe } from "@angular/common";

// Bottom sheet component
@Component({
   selector: "bottom-sheet-files",
   templateUrl: "bottom-sheet-files.html"
})
export class BottomSheetFiles implements OnInit {
   @ViewChild("alertError", { static: true }) alertError;

   ORDER_STATES = ORDER_STATES;
   FILE_STATES = FILE_STATES;
   RING_STATES = RING_STATES;
   ringedGroups: any[];
   messageError: string;

   constructor(
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,
      public router: Router,
      private cd: ChangeDetectorRef,
      private sedeService: SedeService,
      private _bottomSheetRef: MatBottomSheetRef<BottomSheetFiles>,
      @Inject(MAT_BOTTOM_SHEET_DATA) public order: OrderCampus
   ) {
      console.log(order);
   }

   ngOnInit() {
      this.ringedGroups = this.createRingedGroups();
      console.log(this.ringedGroups);
   }

   ngOnDestroy(): void {
      //Called once, before the instance is destroyed.
      //Add 'implements OnDestroy' to the class.
      this._bottomSheetRef.dismiss(this.order);
   }


   openLink(event: MouseEvent): void {
      this._bottomSheetRef.dismiss(this.order);
      event.preventDefault();
   }

   onChangeFileState(orderId, fileId, stateId) {
      console.log(orderId, fileId, stateId);
      this.patchOrderFile(orderId, fileId, stateId)
         .then(order => { this.order = order; this.cd.markForCheck(); })
         .catch(error => console.log(error))

      // const orderFile = this.order.orderFiles.find(orderFile => orderFile.id === fileId);
      // orderFile.state.id = stateId;
      // orderFile.state.name = orderFile.state.id == ORDER_STATES.IMPRESO ? "Impreso" : "Por imprimir";
      // console.log("orderFile: ", orderFile, "order: ", this.order);
   }

   onChangeRingState(orderId, ringGroupId, stateId) {
      console.log(orderId, ringGroupId, stateId);
      this.patchOrderRing(orderId, ringGroupId, stateId)
         .then(order => this.order = order)
         .then(_ => this.ringedGroups = this.createRingedGroups())
         .then(_ => this.cd.markForCheck())
         .catch(err => this.handleErrors(err));

   }

   createRingedGroups() {
      const ringedGroups = [];
      const orderFiles: any[] = this.order.orderFiles;
      let indexPushed;
      orderFiles.forEach(order => {
         /** *
          * TODO: Debería preguntar por ringedGroup, pero me manda objeto con atr nulos,
          * en vez de mandar el obj como nulo
          * */
         if (!!order.configuration.ringedOrder) {
            const ringed = ringedGroups.find(ring => {
               return ring.id == order.configuration.ringedGroup.id;
            });
            // Si no existe el anillado, lo inserto
            if (!ringed) {
               indexPushed = ringedGroups.push({
                  id: order.configuration.ringedGroup.id,
                  price: order.configuration.ringedGroup.price,
                  name: order.configuration.ringedGroup.item.name,
                  state: order.configuration.ringedGroup.state,
                  someOrderFileId: order.id,
                  files: []
               });
               ringedGroups[indexPushed - 1].files[order.configuration.ringedOrder - 1] = {
                  name: order.file.name,
                  course: order.file.course.name
               };
            }
            // Si ya existe, inserto el archivo en el order correspondiente.
            else {
               ringed.files[order.configuration.ringedOrder - 1] = {
                  name: order.file.name,
                  course: order.file.course.name
               };
            }
         }
      });
      return ringedGroups;
   }

   /************
    * SERVICES *
    ************/

   patchOrderFile(orderId: number, orderFileId: number, stateId: number): Promise<any> {
      return new Promise((resolve, reject) => {
         this.sedeService.patchOrderFile(orderId, orderFileId, stateId).subscribe(
            (attention) => resolve(attention),
            (error) => {
               console.log('entro en error');

               reject(error)
            },
         );
      });
   }

   patchOrderRing(orderId: number, ringGroupId: number, stateId: number): Promise<any> {
      return new Promise((resolve, reject) => {
         this.sedeService.patchOrderRing(orderId, ringGroupId, stateId).subscribe(
            (attention) => resolve(attention),
            (error) => reject(error),
         );
      });
   }

   handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
         this.alertError.openError(this.messageError);
      }
   }
}

@Component({
   selector: "cei-orders",
   templateUrl: "./orders.component.html",
   styleUrls: ["./orders.component.scss"]
})
export class OrdersComponent implements OnInit {
   private paginator: MatPaginator;
   private sort: MatSort;

   @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
      mp && this.dataOrders ? ((this.paginator = mp), this.setDataSourceAttributes()) : null;
   }

   @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
      ms && this.dataOrders ? ((this.sort = ms), (this.dataOrders.sort = this.sort)) : null;
   }

   @ViewChild("alertError", { static: true }) alertError;
   public readonly TITLE = "Pedidos en curso";
   messageError: string;
   dataOrders;
   ORDER_STATES = ORDER_STATES;
   FILE_STATES = FILE_STATES;
   orders: OrderCampus[] = [];
   displayedColumns: string[] = [
      "id",
      "dateOrdered",
      "dni",
      "nameAndSurname",
      "totalPrice",
      "amountPaid",
      "state",
      "actions"
   ];
   constructor(
      private cd: ChangeDetectorRef,
      private datePipe: DatePipe,
      private generalService: GeneralService,
      private sedeService: SedeService,
      private orderService: OrdersService,
      public router: Router,
      private _bottomSheet: MatBottomSheet,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
   ) { }

   ngOnInit() {
      this.generalService.sendMessage({ title: this.TITLE });
      this.getActiveOrders();
   }

   setDataSourceAttributes() {
      this.dataOrders.paginator = this.paginator;
      // this.dataSource.sort = this.sort;
      this.paginator._intl.itemsPerPageLabel = "Registros por página";
      this.paginator._intl.firstPageLabel = "Primera página";
      this.paginator._intl.lastPageLabel = "Última páginaaa";
      this.paginator._intl.nextPageLabel = "Página siguiente";
      this.paginator._intl.previousPageLabel = "Página anterior";
   }

   applyFilter(filterValue: string) {
      this.dataOrders.filter = filterValue.trim().toLowerCase();
   }


   // TODO: hacer un metodo para actualizar las orders, luego de que se hace el patch en la orden
   // TODO: especifica, en el bottom sheet 

   updateMatTableOrders() {
      this.dataOrders = new MatTableDataSource(this.orders);
      this.dataOrders.sortingDataAccessor = (item, property) => {
         switch (property) {
            case "nameAndSurname":
               return item.user.name + " " + item.user.surname;
            case "id":
               return item.id;
            case "dni":
               return item.user.dni;
            case "state":
               return item.state.name;
            default:
               return item[property];
         }
      };
      this.dataOrders.filterPredicate = (data, filter) => {
         // console.log(data, filter);

         const userNameAndSurname = data.user.name.toLowerCase() + " " + data.user.surname.toLowerCase();
         const document = data.user.dni ? data.user.dni.toString() : "";
         const state = data.state.name.toLowerCase().toString();
         const date = this.datePipe.transform(data.dateOrdered, "dd/MM/yy H:mm");
         console.log("state: ", state);
         // console.log('datastr: ', cif);

         return (
            userNameAndSurname.indexOf(filter) != -1 ||
            state.indexOf(filter) != -1 ||
            document.indexOf(filter) != -1 ||
            date.lastIndexOf(filter) != -1
         );
      };
   }

   onReloadOrders() {
      this.getActiveOrders();
   }

   onClickChangeStateOrder(stateId: number, order: OrderCampus) {
      console.log(stateId, order)
      this.patchOrder(order.id, stateId)
         .then(orderUpdated => {
            const indexOrderUpdated = this.orders.findIndex(order => order.id === orderUpdated.id);
            if (indexOrderUpdated !== -1) {
               this.orders[indexOrderUpdated] = orderUpdated;
               this.updateMatTableOrders();
            }
         })
         .catch(err => this.handleErrors(err));
   }

   getActiveOrders() {
      this.orderService.getOrders(true).subscribe(
         orders => {
            this.orders = <any>orders;
            this.dataOrders = new MatTableDataSource(this.orders);
            this.dataOrders.sortingDataAccessor = (item, property) => {
               switch (property) {
                  case "nameAndSurname":
                     return item.user.name + " " + item.user.surname;
                  case "id":
                     return item.id;
                  case "dni":
                     return item.user.dni;
                  case "state":
                     return item.state.name;
                  default:
                     return item[property];
               }
            };
            this.dataOrders.filterPredicate = (data, filter) => {
               // console.log(data, filter);

               const userNameAndSurname = data.user.name.toLowerCase() + " " + data.user.surname.toLowerCase();
               const document = data.user.dni ? data.user.dni.toString() : "";
               const state = data.state.name.toLowerCase().toString();
               const date = this.datePipe.transform(data.dateOrdered, "dd/MM/yy H:mm");
               console.log("state: ", state);
               // console.log('datastr: ', cif);

               return (
                  userNameAndSurname.indexOf(filter) != -1 ||
                  state.indexOf(filter) != -1 ||
                  document.indexOf(filter) != -1 ||
                  date.lastIndexOf(filter) != -1
               );
            };

            console.log(this.orders);
            console.log(this.dataOrders);
         },
         err => this.handleErrors(err)
      );
   }

   openBottomSheet(orderId): void {
      console.log(orderId);
      const order = this.orders.find(order => {
         return order.id === orderId;
      });
      this._bottomSheet._openedBottomSheetRef = this._bottomSheet.open(BottomSheetFiles, { data: order });
      this._bottomSheet._openedBottomSheetRef.afterDismissed().subscribe((orderUpdated: OrderCampus) => {
         const indexOrderUpdated = this.orders.findIndex(order => order.id === orderUpdated.id);
         console.log(indexOrderUpdated, this.orders, orderUpdated);

         if (indexOrderUpdated !== -1) {
            this.orders[indexOrderUpdated] = orderUpdated;
            this.updateMatTableOrders();
         }
      });
   }

   // ordersInProcess = () => this.orders.filter(order => order.state.id == ORDER_STATES.EN_PROCESO).length;
   // waitingOrders = () => this.orders.filter(order => order.state.id == ORDER_STATES.SOLICITADO).length;
   // ordersToDeliver = () => this.orders.filter(order => order.state.id == ORDER_STATES.PARA_RETIRAR).length;

   handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
         this.alertError.openError(this.messageError);
      }
   }


   /************
    * SERVICES *
    ************/

   patchOrder(orderId: number, stateId: number): Promise<OrderCampus> {
      return new Promise((resolve, reject) => {
         this.sedeService.patchOrder(orderId, stateId).subscribe(
            (order) => resolve(order),
            (error) => {
               reject(error)
            },
         );
      });
   }
}
