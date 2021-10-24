import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Movement } from 'src/app/_models/movement';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { MOVEMENTS } from 'src/app/_movements/movements';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { GeneralService } from 'src/app/_services/general.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { MovementService } from 'src/app/_services/movement.service';
import {AnimationOptions} from 'ngx-lottie';

export enum movementType {
  ALL = 'Todos los movimientos',
  TRANSFER = 'Transferencias',
  TOP_UP = 'Cargas de saldo',
  REQUESTED_ORDER = 'Pedidos',
  CANCELLED_ORDER = 'Pedidos cancelados',
}


@Component({
  selector: 'cei-movements',
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.scss']
})
export class MovementsComponent implements OnInit {
  movementType = movementType;
  movementsEnum = MOVEMENTS;
  movementTypeSelected;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  inputFilterValue = ''
  movements: Movement[]; isLoadingGetMovements = false; _movements: Subscription;
  dataSourceMovements: MatTableDataSource<Movement>; /*isLoadingGetItems = false;*/
  displayedColumns: string[] = [
    'movementDate',
    'movementType',
    'movementSource',
    'movementTarget',
    'movementAmount',
    //'actions',
  ];
  // metadata from api
  metaDataItems: MetadataAPI;
  linksItems: LinksAPI;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];
  fb: FilterBuilder;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;
  noOrdersLottie: AnimationOptions = {
      path: 'assets/animations/empty-orders.json',
      loop: false
   };

  constructor(public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private authenticationService: AuthenticationService, private movementService: MovementService, public generalService: GeneralService) { }

  ngOnInit() {
    this.fb = new FilterBuilder();
    this.generalService.sendMessage({title: 'Movimientos'})
    this.movementTypeSelected = this.movementsEnum.ALL;
    this.sort = [{ field: 'movement.createdAt', sort: "DESC" }]
    this.getMyMovements(this.filter, this.sort, this.pagination).toPromise().catch(error => this.handleErrors(error))
    this.dataSourceMovements = new MatTableDataSource();
  }

  ngOnDestroy(): void {
    this._movements.unsubscribe();
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getMyMovements(this.filter, this.sort, this.pagination).toPromise().catch(error => this.handleErrors(error))
  }

  onRefresh(): Promise<void | Movement[]> {
    return this.getMyMovements(this.filter, this.sort, this.pagination).toPromise().catch(error => this.handleErrors(error))
  }

  // Services

  getMyMovements(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Movement[]> {
    this.isLoadingGetMovements = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._movements = this.movementService.getMyMovements(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetMovements = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataItems = data.data.meta; this.linksItems = data.data.links; this.dataSourceMovements.data = data.data.items; res(data.data.items) },
        (e) => { rej(e) },
      )
    })
    return from(promise);
  }

  onTypeMovementFilter(movementType?: movementType) {
    this.inputFilterValue = '';
    console.log(movementType);
    this.movementTypeSelected = movementType;
    console.log(this.movementTypeSelected);
    this.filter = !!movementType ? this.fb.and(this.fb.where('type.code', OPERATORS.IS, movementType)) : null;
    this.getMyMovements(this.filter, this.sort, this.pagination).toPromise().catch(error => this.handleErrors(error))
  }

  isIncome(movement: Movement) {
    return movement.target.id === this.authenticationService.currentUserValue.id;
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
