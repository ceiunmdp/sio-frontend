import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheet, MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Order } from 'src/app/_models/orders/order';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { GeneralService } from 'src/app/_services/general.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { OrdersService } from '../../student/orders/orders.service';
import { BottomSheetFiles } from '../orders/orders.component';
import {ORDER_STATES} from 'src/app/_orderStates/states';
import Swal from 'sweetalert2';
import {SedeService} from '../sede.service';

@Component({
    selector: 'cei-historic-orders',
    templateUrl: './historic-orders.component.html',
    styleUrls: ['./historic-orders.component.scss'],
})
export class HistoricOrdersComponent implements OnInit {
    public readonly TITLE = 'Historial de pedidos';
    isLoadingPatchOrder = {};
    ORDER_STATES = ORDER_STATES;
    inputFilterValue = '';
    // metadata from api
    metaDataOrders: MetadataAPI;
    linksCareers: LinksAPI;
    // metadata from ui
    pagination: Pagination;
    filter: OR | AND;
    sort: Sort[];
    fb: FilterBuilder;
    isLoadingGetOrders = false;
    displayedColumns: string[] = ['id', 'date', 'dni', 'student', 'state', 'subtotal', 'totalPrice', 'actions'];
    dataSourceOrders;
    @ViewChild('alertError', { static: true }) alertError;
    messageError: string;

    constructor(
        private generalService: GeneralService,
        private sedeService: SedeService,
        private orderService: OrdersService,
        private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,
        public router: Router,
        private _bottomSheet: MatBottomSheet
    ) {}

    ngOnInit() {
        this.generalService.sendMessage({ title: this.TITLE });
        this.fb = new FilterBuilder();
        this.sort = [{ field: 'order.createdAt', sort: 'DESC' }];
        this.getHistoricOrders(this.sort, this.pagination);
        this.dataSourceOrders = new MatTableDataSource();
    }

    onPaginatorEvent(event: PageEvent) {
        this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 };
        this.getHistoricOrders(this.sort, this.pagination);
    }

    onRefresh() {
        this.getHistoricOrders(this.sort, this.pagination);
    }

    onSearch(st: string) {
        st = st.toLowerCase();
        // TODO: No anda
        this.filter = this.fb.and(
            this.fb.where('state.code', OPERATORS.IN, ['cancelled', 'undelivered', 'delivered']),
            this.fb.or(this.fb.where('student.dni', OPERATORS.CONTAINS, st.trim()), this.fb.where('student.full_name', OPERATORS.CONTAINS, st.trim()), this.fb.where('id_number', OPERATORS.IS, st))
        );
        this.getOrdersService(this.filter).catch((err) => this.handleErrors(err));
    }

    getHistoricOrders(sort?: Sort[], pagination?: Pagination) {
        this.filter = this.fb.or(this.fb.where('state.code', OPERATORS.IN, ['cancelled', 'undelivered', 'delivered']));
        this.getOrdersService(this.filter, sort, pagination).catch((err) => this.handleErrors(err));
    }

    onClickChangeStateOrder(order, stateCode: string) {
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
          this.patchOrder(order.id, stateCode)
            .then(orderUpdated => {
              order.state = orderUpdated.state;
            })
            .catch(err => this.handleErrors(err));
        },
        allowOutsideClick: () => !Swal.isLoading()
      });
    }

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

    openBottomSheet(order): void {
        order.isLoading = true;
        this.orderService
            .getOrderFiles(order.id)
            .toPromise()
            .then((response) => {
                return response.items;
            })
            .then((orderFiles) => this.setItemsPrice(orderFiles))
            .then((orderFiles) => {
                const _order = { ...order, orderFiles };
                const data = { _order, actualState: order.state };
                this._bottomSheet._openedBottomSheetRef = this._bottomSheet.open(BottomSheetFiles, { data });
            })
            .catch(err => {this.handleErrors(err)})
            .finally(() => (order.isLoading = false));
    }

    private setItemsPrice(orderFiles) {
        const orderFilesAgrouped = this.agroupConfigurations(orderFiles);
        return orderFiles.map((orderFile) => {
            const configuration = orderFilesAgrouped.find((orderFileAgrouped) => orderFileAgrouped.configuration.id === orderFile.configuration.id);
            const itemPrice = configuration.total / configuration.quantity;
            return { ...orderFile, itemPrice };
        });
    }

    private agroupConfigurations(orderFiles) {
        return orderFiles.reduce((arrayOrderFiles: any[], orderFile) => {
            const index = arrayOrderFiles.findIndex((_orderFile) => _orderFile.configuration.id == orderFile.configuration.id);
            if (index === -1) {
                arrayOrderFiles.push({ ...orderFile, quantity: 1 });
            } else {
                arrayOrderFiles[index].quantity++;
            }
            return arrayOrderFiles;
        }, []);
    }

    private getOrdersService(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Promise<Order[]> {
        this.isLoadingGetOrders = true;
        const promise: Promise<any> = new Promise((res, rej) => {
            this.orderService
                .getOrders(filter, sort, pagination)
                .pipe(
                    finalize(() => {
                        this.isLoadingGetOrders = false;
                    })
                )
                .subscribe(
                    (data) => {
                        this.metaDataOrders = data.data.meta;
                        this.linksCareers = data.data.links;
                        this.dataSourceOrders.data = data.data.items;
                        res(data.data.items);
                    },
                    (e) => {
                        rej(e);
                    }
                );
        });
        return promise;
    }

    handleErrors(err: HttpErrorResponse) {
        this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
        if (this.messageError) {
            this.alertError.openError(this.messageError);
        }
    }
}
