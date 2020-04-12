import { Component, OnInit, ViewChild } from "@angular/core";
import { OrdersService } from "src/app/logged/orders/orders.service";
import { Order } from "src/app/_models/orders/order";
import { GeneralService } from "src/app/_services/general.service";
import { HttpErrorResponseHandlerService } from "src/app/_services/http-error-response-handler.service";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { MonedaPipe } from "src/app/_utils/moneda.pipe";
import { Routes } from "src/app/_routes/routes";
import { MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import { DatePipe } from "@angular/common";

@Component({
   selector: "cei-my-orders",
   templateUrl: "./my-orders.component.html",
   styleUrls: ["./my-orders.component.scss"]
})
export class MyOrdersComponent implements OnInit {
   private paginator: MatPaginator;
   private sort: MatSort;
   @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
      mp && this.dataSource ? ((this.paginator = mp), this.setDataSourceAttributes()) : null;
   }

   @ViewChild(MatSort, { static: false }) set matSort(ms: MatSort) {
      ms && this.dataSource ? ((this.sort = ms), (this.dataSource.sort = this.sort)) : null;
   }
   @ViewChild("alertError", { static: true }) alertError;
   messageError: string;
   ROUTES = Routes;
   readonly TITLE = "Mis pedidos";
   orders: Order[] = [];
   displayedColumns: string[] = ["id", "date", "campus", "state", "totalPrice", "actions"];
   dataSource;
   pipeMoneda = new MonedaPipe();
   historicOrdersShow: boolean;

   constructor(
      private datePipe: DatePipe,
      public generalService: GeneralService,
      public orderService: OrdersService,
      public router: Router,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
   ) {}

   ngOnInit() {
      this.generalService.sendMessage({ title: this.TITLE });
      this.getActiveOrders();
   }

   applyFilter(filterValue: string) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
   }

   setDataSourceAttributes() {
      this.dataSource.paginator = this.paginator;
      // this.dataSource.sort = this.sort;
      this.paginator._intl.itemsPerPageLabel = "Registros por página";
      this.paginator._intl.firstPageLabel = "Primera página";
      this.paginator._intl.lastPageLabel = "Última páginaaa";
      this.paginator._intl.nextPageLabel = "Página siguiente";
      this.paginator._intl.previousPageLabel = "Página anterior";
   }

   sortingDataAccessor = (item, property) => {
      switch (property) {
         case "date":
            return item.dateOrdered;
         case "id":
            return item.id;
         case "campus":
            return item.campus.name;
         case "state":
            return item.state.name;
         default:
            return item[property];
      }
   };

   filterPredicate = (data, filter) => {
      console.log(data, filter);
      const id = data.id.toString();
      const campus = data.campus.name.toLowerCase().toString();
      const state = data.state.name.toLowerCase().toString();
      const date = this.datePipe.transform(data.dateOrdered, "dd/MM/yy H:mm");
      return (
         state.indexOf(filter) != -1 ||
         campus.indexOf(filter) != -1 ||
         id.indexOf(filter) != -1 ||
         date.lastIndexOf(filter) != -1
      );
   };

   getActiveOrders() {
      this.getOrdersService(true)
         .then(orders => (this.orders = orders))
         .then(_ => (this.historicOrdersShow = false))
         .then(_ => (this.dataSource = new MatTableDataSource(this.orders)))
         .then(_ => (this.dataSource.sortingDataAccessor = this.sortingDataAccessor))
         .then(_ => (this.dataSource.filterPredicate = this.filterPredicate))
         .catch(err => this.handleErrors(err));
   }

   getHistoricOrders() {
      this.getOrdersService()
         .then(orders => (this.orders = orders))
         .then(_ => (this.historicOrdersShow = true))
         .then(_ => (this.dataSource = new MatTableDataSource(this.orders)))
         .then(_ => (this.dataSource.sortingDataAccessor = this.sortingDataAccessor))
         .then(_ => (this.dataSource.filterPredicate = this.filterPredicate))
         .catch(err => this.handleErrors(err));
   }

   private getOrdersService(active?: boolean): Promise<any[]> {
      return new Promise((resolve, reject) => {
         this.orderService.getOrders(active).subscribe(
            orders => resolve(orders),
            err => reject(err)
         );
      });
   }

   onClickOrderDetail(order) {
      console.log(order, `${Routes.ORDER_DETAIL}/${order.id}`);
      this.router.navigate([`${Routes.ORDER_DETAIL}/${order.id}`], { state: { order } });
   }

   handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
         this.alertError.openError(this.messageError);
      }
   }
}
