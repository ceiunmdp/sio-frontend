import { Component, OnInit, ViewChild, Inject } from "@angular/core";
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
import { OrderCampus } from "src/app/_models/orders/orderCampus";
import { DatePipe } from "@angular/common";

// Bottom sheet component
@Component({
   selector: "bottom-sheet-files",
   templateUrl: "bottom-sheet-files.html"
})
export class BottomSheetFiles implements OnInit {
   ORDER_STATES = ORDER_STATES;
   constructor(
      private _bottomSheetRef: MatBottomSheetRef<BottomSheetFiles>,
      @Inject(MAT_BOTTOM_SHEET_DATA) public order: OrderCampus
   ) {
      console.log(order);
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

   onChangeFileState(orderId, fileId, stateId) {
      console.log(orderId, fileId, stateId);
      const orderFile = this.order.orderFiles.find(orderFile => orderFile.id === fileId);
      orderFile.state.id = stateId;
      orderFile.state.name = orderFile.state.id == ORDER_STATES.IMPRESO ? "Impreso" : "Por imprimir";
      console.log("orderFile: ", orderFile, "order: ", this.order);
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
      private datePipe: DatePipe,
      private generalService: GeneralService,
      private sedeService: SedeService,
      private orderService: OrdersService,
      public router: Router,
      private _bottomSheet: MatBottomSheet,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
   ) {}

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
      this._bottomSheet.open(BottomSheetFiles, { data: order });
   }

   ordersInProcess = () => this.orders.filter(order => order.state.id == ORDER_STATES.EN_PROCESO).length;
   waitingOrders = () => this.orders.filter(order => order.state.id == ORDER_STATES.SOLICITADO).length;
   ordersToDeliver = () => this.orders.filter(order => order.state.id == ORDER_STATES.PARA_RETIRAR).length;

   handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
         this.alertError.openError(this.messageError);
      }
   }
}
