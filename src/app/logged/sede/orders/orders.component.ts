import {DatePipe} from "@angular/common";
import {HttpErrorResponse} from "@angular/common/http";
import {ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {
  MatBottomSheet, MatBottomSheetRef,


  MatPaginator,
  MatSort, MatTableDataSource,

  MAT_BOTTOM_SHEET_DATA
} from "@angular/material";
import {Router} from "@angular/router";
import {AnimationOptions} from "ngx-lottie";
import {FILE_STATES} from "src/app/_fileStates/states";
import {OrderCampus} from "src/app/_models/orders/orderCampus";
import {Printer} from "src/app/_models/printer";
import {ORDER_STATES} from "src/app/_orderStates/states";
import {RING_STATES} from "src/app/_ringStates/states";
import {GeneralService} from "src/app/_services/general.service";
import {HttpErrorResponseHandlerService} from "src/app/_services/http-error-response-handler.service";
import {CustomValidators} from "src/app/_validators/custom-validators";
import {OrdersService} from "../../student/orders/orders.service";
import {SedeService} from "../sede.service";
import {WsOrdersService} from "./ws-orders.service";
import Swal from 'sweetalert2';

// Bottom sheet component
@Component({
   selector: "bottom-sheet-files",
   templateUrl: "bottom-sheet-files.html"
})
export class BottomSheetFiles implements OnInit {
   @ViewChild("alertError", { static: true }) alertError;
   expanded = 0;
   ORDER_STATES = ORDER_STATES;
   FILE_STATES = FILE_STATES;
   RING_STATES = RING_STATES;
   ringedGroups: any[];
   messageError: string;
   printers: Printer[];
   isLoadingPrinters = false;
   noPrinterOption = {
     id: 0,
     name: 'Impresión manual'
   };
   printerForm: FormGroup;
   order;
   actualState;
   public readonly PRINTER_NAME = 'printer';
   constructor(
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,
      public router: Router,
      private wsOrdersService: WsOrdersService,
      private sedeService: SedeService,
      private formBuilder: FormBuilder,
      private ordersService: OrdersService,
      private _bottomSheetRef: MatBottomSheetRef<BottomSheetFiles>,
      private cd: ChangeDetectorRef,
      @Inject(MAT_BOTTOM_SHEET_DATA) public data
   ) {
     this.order = data._order;
     this.actualState = data.actualState;
      console.log(data);
   }

   ngOnInit() {
      this.wsOrdersService.joinOrderRoom(this.order.id);
      this.wsOrdersService.subscribeToUpdatedBindingGroup(this.onUpdateBindingGroup);
      this.wsOrdersService.subscribeToUpdatedOrderFile(this.onUpdateOrderFile);
      this.getPrinters()
        .then(printers => {
          this.printers = printers;
          console.log(this.printers);
        })
        .then(_ => this.printerForm = this.createPrinterForm())
        .then(_ => this.bindFormControls())
        .then(_ => this.cd.markForCheck())
      this.ringedGroups = this.createRingedGroups(this.order.orderFiles);
   }

   ngOnDestroy(): void {
      this._bottomSheetRef.dismiss(this.order);
      this.wsOrdersService.leaveOrderRoom(this.order.id);
   }

   openFile(file) {
    file.isLoading = true;
    console.log(file);
    this.ordersService.getFile(file.id).subscribe(
      (blob: any) => {
        var fileURL: any = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = fileURL;
        a.target = '_blank';
        a.click();
        console.log(blob);
      },
      error => { this.handleErrors(error) },
      () => file.isLoading = false
    );
  }

   onUpdateBindingGroup = (bindingGroup) => {
    console.log(bindingGroup);
    const ringedGroupIndex = this.ringedGroups.findIndex(ringedGroup => ringedGroup.id == bindingGroup.id);
    if(ringedGroupIndex != -1) {
      this.ringedGroups[ringedGroupIndex].state = {...bindingGroup.state};
      this.cd.markForCheck();
    }
   }

   onUpdateOrderFile = (orderFile) => {
    const orderFileIndex = this.order.orderFiles.findIndex(_orderFile => _orderFile.id === orderFile.id);
    this.order.orderFiles[orderFileIndex] = {...this.order.orderFiles[orderFileIndex], state: orderFile.state};
    console.log(orderFile);
    console.log(this.order.orderFiles[orderFileIndex])
    this.cd.markForCheck();
    console.log(this.order.orderFiles);
   }

   bindFormControls() {
      this.printerForm.get(this.PRINTER_NAME).valueChanges.subscribe(value => {
        console.log('entro', value);
        this.printerForm.get(this.PRINTER_NAME).setValue(value, { onlySelf: true, emitEvent: false, emitModelToViewChange: true });
    }, error => {}, () => { });
   }

   createPrinterForm(): FormGroup {
    return this.formBuilder.group({
      [this.PRINTER_NAME]: [this.printers[0].id.toString(), [CustomValidators.required("Por favor elija una opción")]],
    });
  }

   openLink(event: MouseEvent): void {
      this._bottomSheetRef.dismiss(this.order);
      event.preventDefault();
   }

   onPrintFile(orderId, orderFile) {
     orderFile.isLoading = true;
     const printer_id = this.printerForm.get(this.PRINTER_NAME).value == 0 ? null : this.printerForm.get(this.PRINTER_NAME).value;
     const stateCode = !!printer_id ? FILE_STATES.PRINTING : FILE_STATES.PRINTED;
      this.patchOrderFile(orderId, orderFile.id, stateCode, printer_id)
         .catch(error => this.handleErrors(error))
         .finally(() => {
           orderFile.isLoading = false
           this.cd.markForCheck();
         });
   }

   onChangeRingState(orderId, ringGroupId, stateCode) {
      this.patchOrderRing(orderId, ringGroupId, stateCode)
         .catch(err => this.handleErrors(err));
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
              files: [],
              state: order.binding_group.state
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

   /************
    * SERVICES *
    ************/

   getPrinters(): Promise<any[]> {
      this.isLoadingPrinters = true;
      return this.sedeService.getPrinters()
        .toPromise()
        .then(printers => {
          let printersArray = [this.noPrinterOption];
          printersArray = printersArray.concat(printers);
          return printersArray;
        })
        .finally(() => this.isLoadingPrinters = false)
   }

   patchOrderFile(orderId: number, orderFileId: number, stateCode: string, printer_id?: string): Promise<any> {
      return new Promise((resolve, reject) => {
         this.sedeService.patchOrderFile(orderId, orderFileId, stateCode, printer_id).subscribe(
            (attention) => resolve(attention),
            (error) => {
               reject(error)
            },
         );
      });
   }

   patchOrderRing(orderId: number, ringGroupId: number, stateCode: string): Promise<any> {
      return new Promise((resolve, reject) => {
         this.sedeService.patchOrderRing(orderId, ringGroupId, stateCode).subscribe(
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
   dataOrders: MatTableDataSource<any>
   ORDER_STATES = ORDER_STATES;
   FILE_STATES = FILE_STATES;
   orders: OrderCampus[] = [];
   isLoadingPendingOrders: boolean;
   isLoadingPatchOrder = {};
   noOrdersLottie: AnimationOptions = {
      path: 'assets/animations/empty-orders.json',
      loop: false
   };
   displayedColumns: string[] = [
      "id",
      "dateOrdered",
      "dni",
      "nameAndSurname",
      "subtotal",
      "totalPrice",
      // "amountPaid",
      "state",
      "actions"
   ];
   constructor(
      private datePipe: DatePipe,
      private generalService: GeneralService,
      private sedeService: SedeService,
      public router: Router,
      private _bottomSheet: MatBottomSheet,
      private wsOrdersService: WsOrdersService,
      private orderService: OrdersService,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
   ) { }

   ngOnInit() {
      this.generalService.sendMessage({ title: this.TITLE });
      this.dataOrders = this.initializeDataTable();
      this.isLoadingPendingOrders = true;
      this.wsOrdersService.connect(this.onConnectedWs, this.onDisconnectWs)

    };

    onConnectedWs = () => {
      this.isLoadingPendingOrders = false;
      this.wsOrdersService.getPendingOrders(this.onGetPendingOrder);
      this.wsOrdersService.subscribeToNewPendingOrder(this.onGetPendingOrder);
      this.wsOrdersService.subscribeToUpdatedOrder(this.onUpdatedOrder);
    }

    onDisconnectWs = () => {
      console.log('WS DISCONNECTED');
    }

    initializeDataTable() {
      const dataOrders = new MatTableDataSource([]);
      dataOrders.filterPredicate = this.filterPredicate;
      dataOrders.sortingDataAccessor = this.sortingDataAccessor;
      return dataOrders;
    }

    onGetPendingOrder = (order) => {
      this.orders.push(order);
      this.dataOrders.data = this.orders;
    }

    onUpdatedOrder = (order) => {
      const orderIndex = this.orders.findIndex(_order => _order.id == order.id);
      if(order.state.code === ORDER_STATES.CANCELADO || order.state.code === ORDER_STATES.ENTREGADO || order.state.code === ORDER_STATES.NO_ENTREGADO){
        if(orderIndex != -1){
          this.orders.splice(orderIndex, 1);
        }
      } else {
        if(orderIndex == -1){
          this.orders.push(order);
        } else {
          this.orders[orderIndex] = order;
          this.updateBottomSheetData(order);
        }
      }
      this.dataOrders.data = this.orders;
    }

    updateBottomSheetData(order) {
      if(this._bottomSheet && this._bottomSheet._openedBottomSheetRef && this._bottomSheet._openedBottomSheetRef.instance){
        const instance = this._bottomSheet._openedBottomSheetRef.instance;
        if(instance.order.id == order.id){
          instance.actualState = {...order.state};
        }
      }
    }

   setDataSourceAttributes() {
      this.dataOrders.paginator = this.paginator;
      this.paginator._intl.itemsPerPageLabel = "Registros por página";
      this.paginator._intl.firstPageLabel = "Primera página";
      this.paginator._intl.lastPageLabel = "Última páginaaa";
      this.paginator._intl.nextPageLabel = "Página siguiente";
      this.paginator._intl.previousPageLabel = "Página anterior";
   }

   applyFilter(filterValue: string) {
      this.dataOrders.filter = filterValue.trim().toLowerCase();
   }

   private sortingDataAccessor = (item, property) => {
    switch (property) {
      case "nameAndSurname":
        return item.student.display_name;
      case "dateOrdered":
        return item.tracking[0].timestamp;
      case "id":
        return item.id;
      case "dni":
        return item.student.dni;
      case "state":
        return item.state.name;
      default:
        return item[property];
    }
  }

  onClickChangeStateOrder(orderId: string, stateCode: string) {
    let stateName;
    switch (stateCode) {
      case this.ORDER_STATES.CANCELADO:
        stateName = 'cancelar'
        break;
      case this.ORDER_STATES.ENTREGADO:
        stateName = 'entregar'
        break;
      case this.ORDER_STATES.NO_ENTREGADO:
        stateName = 'no entregar'
        break;
      default:
        break;
    }
    Swal.fire({
      title: 'Confirme el cambio de estado',
      html: `¿Seguro desea <b>${stateName}</b> el pedido?`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        this.patchOrder(orderId, stateCode)
          .catch(err => this.handleErrors(err));
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
  }

   private filterPredicate = (data, filter) => {
      const id = data.id_number;
      const userNameAndSurname = data.student && data.student.display_name ? data.student.display_name.toLowerCase() : '';
      const document = data.student.dni ? data.student.dni.toString() : "";
      const state = data.state.name.toLowerCase().toString();
      const date = this.datePipe.transform(data.tracking[0].timestamp, "dd/MM/yy H:mm");
      return (
        id == filter ||
        userNameAndSurname.indexOf(filter) != -1 ||
        state.indexOf(filter) != -1 ||
        document.indexOf(filter) != -1 ||
        date.lastIndexOf(filter) != -1
      );
  };

   openBottomSheet(order): void {
     order.isLoading = true;
     this.orderService.getOrderFiles(order.id)
      .toPromise()
      .then(response => {console.log(response); return response.items})
      .then(orderFiles => this.setItemsPrice(orderFiles))
      .then(orderFiles => {
        const _order = {...order, orderFiles}
        const data = {_order, actualState: order.state }
        this._bottomSheet._openedBottomSheetRef = this._bottomSheet.open(BottomSheetFiles, { data });
      })
      .finally(() => order.isLoading = false);
   }

   private setItemsPrice(orderFiles) {
     const orderFilesAgrouped = this.agroupConfigurations(orderFiles);
     return orderFiles.map(orderFile => {
       const configuration = orderFilesAgrouped.find(orderFileAgrouped => orderFileAgrouped.configuration.id === orderFile.configuration.id);
       const itemPrice = configuration.total / configuration.quantity;
       return {...orderFile, itemPrice};
     })
   }

   private agroupConfigurations (orderFiles) {
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

   patchOrder(orderId: string, stateCode: string): Promise<any> {
      this.isLoadingPatchOrder[orderId] = true;
      return new Promise((resolve, reject) => {
         this.sedeService.patchOrder(orderId, stateCode).subscribe(
            (order) => resolve(order),
            (error) => {
               reject(error)
            },
         );
      })
        .finally(() => this.isLoadingPatchOrder[orderId] = false);
   }
}
