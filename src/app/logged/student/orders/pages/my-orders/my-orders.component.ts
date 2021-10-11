import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Order } from 'src/app/_models/orders/order';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { Routes } from 'src/app/_routes/routes';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { GeneralService } from 'src/app/_services/general.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { MonedaPipe } from 'src/app/_utils/moneda.pipe';
import { OrdersService } from '../../orders.service';
import {AnimationOptions} from 'ngx-lottie';

@Component({
  selector: 'cei-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  // metadata from api
  metaDataOrders: MetadataAPI;
  linksCareers: LinksAPI;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];
  fb: FilterBuilder;
  isLoadingGetOrders = false;

  @ViewChild("alertError", { static: true }) alertError;
  messageError: string;
  ROUTES = Routes;
  readonly TITLE = "Mis pedidos";
  orders: Order[] = [];
  displayedColumns: string[] = ["id", "date", "campus", "state", "subtotal", "totalPrice", "actions"];
  dataSourceOrders;
  pipeMoneda = new MonedaPipe();
  historicOrdersShow: boolean;
  rootPath: string;
  noOrdersLottie: AnimationOptions = {
    path: 'assets/animations/empty-orders.json',
    loop: false
  };
  constructor(
    public generalService: GeneralService,
    public orderService: OrdersService,
    private authService: AuthenticationService,
    public router: Router,
    private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
  ) {
    this.historicOrdersShow = this.router.getCurrentNavigation().extras.state ? this.router.getCurrentNavigation().extras.state.historicOrdersShow : null;
  }

  ngOnInit() {
    this.rootPath = this.authService.currentUserValue.rootPath;
    this.generalService.sendMessage({ title: this.TITLE });
    this.fb = new FilterBuilder();
    this.sort = [{ field: 'order.idNumber', sort: "DESC" }];
    this.historicOrdersShow ? this.getHistoricOrders(this.sort, this.pagination) : this.getActiveOrders(this.sort, this.pagination);
    this.dataSourceOrders = new MatTableDataSource();
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.historicOrdersShow ? this.getHistoricOrders(this.sort, this.pagination) : this.getActiveOrders(this.sort, this.pagination);
  }

  onRefresh() {
    this.historicOrdersShow ? this.getHistoricOrders(this.sort, this.pagination) : this.getActiveOrders(this.sort, this.pagination);
  }

  getActiveOrders(sort?: Sort[], pagination?: Pagination) {
    const filter = this.fb.and(
      this.fb.or(
        this.fb.where('state.code', OPERATORS.IN, ['requested', 'in_process', 'ready'])
      )
    );
    this.getOrdersService(filter, sort, pagination)
        .then(_ => (this.historicOrdersShow = false))
        .catch(err => this.handleErrors(err));
  }


  getHistoricOrders(sort?: Sort[], pagination?: Pagination) {
    const filter = this.fb.or(
      this.fb.where('state.code', OPERATORS.IN, ['cancelled', 'undelivered', 'delivered'])
    );
    this.getOrdersService(filter, sort || this.sort, pagination)
        .then(_ => (this.historicOrdersShow = true))
        .catch(err => this.handleErrors(err));
  }

  private getOrdersService(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Promise<Order[]> {
    this.isLoadingGetOrders = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this.orderService.getMyOrders(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetOrders = false;
        })
      ).subscribe(
        (data) => { this.metaDataOrders = data.data.meta; this.linksCareers = data.data.links; this.dataSourceOrders.data = data.data.items; res(data.data.items) },
        (e) => { rej(e) },
      )
    });
    return promise;
  }

  onClickOrderDetail(order) {
    this.router.navigate([`${this.rootPath}${Routes.ORDER_DETAIL}/${order.id}`], { state: { order, historicOrdersShow: this.historicOrdersShow } });
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
        this.alertError.openError(this.messageError);
    }
  }
}
