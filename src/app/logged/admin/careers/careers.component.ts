import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Year } from 'src/app/_models/orders/year';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { AdminService } from 'src/app/_services/admin.service';
import { GeneralService } from 'src/app/_services/general.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import Swal from 'sweetalert2';
import { OrdersService } from '../../student/orders/orders.service';
import { Career } from './../../../_models/orders/career';

enum STEPS {
  LIST,
  CREATE_OR_EDIT
}

@Component({
  selector: 'cei-careers',
  templateUrl: './careers.component.html',
  styleUrls: ['./careers.component.scss']
})
export class CareersComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  inputFilterValue = ''
  public STEPS = STEPS;
  step: STEPS;
  careers: Career[]; isLoadingGetCareers = false; _careers: Subscription;
  years: Year[]; isLoadingGetYears = false; _years: Subscription;
  selectedCareer: Career; // .. !null when edit button is clicked
  dataSourceCareers: MatTableDataSource<Career>; /*isLoadingGetCareers = false;*/
  displayedColumns: string[] = [
    'careerName',
    'actions',
  ];
  // metadata from api
  metaDataCareers: MetadataAPI;
  linksCareers: LinksAPI;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];
  fb: FilterBuilder;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  constructor(private adminService: AdminService, public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private orderService: OrdersService, public generalService: GeneralService) { }

  ngOnInit() {
    this.fb = new FilterBuilder();
    this.step = STEPS.LIST;
    this.sort = [{ field: 'career.name', sort: "ASC" }]
    this.getCareers(this.filter, this.sort, this.pagination);
    this.dataSourceCareers = new MatTableDataSource();
    this.getYears();
  }

  ngOnDestroy(): void {
    this._careers.unsubscribe();
    this._years.unsubscribe();
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getCareers(this.filter, this.sort, this.pagination);
  }

  onRefresh(): Promise<Career[]> {
    return this.getCareers(this.filter, this.sort, this.pagination).toPromise();
  }

  onSearch(st: string) {
    this.filter = this.fb.and(this.fb.where('career.name', OPERATORS.CONTAINS, st));
    this.getCareers(this.filter)
  }

  onClickEditCareer(career: Career) {
    this.selectedCareer = career;
    this.step = STEPS.CREATE_OR_EDIT;
  }

  onClickDeleteCareer(career: Career) {
    Swal.fire({
      title: `¿Seguro desea eliminar la materia ${career.name}?`,
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return this.deleteCareer(career.id).then(deletedCareer => {
          Swal.fire({
            text: 'Materia borrada correctamente',
            icon: 'success'
          })
        }).catch(e => this.handleErrors(e))
      },
      allowOutsideClick: () => !Swal.isLoading()
    })
  }

  fromCreateOrEditToList(refresh = false) {
    this.step = STEPS.LIST;
    this.selectedCareer = null; // Reset selectedCareer
    if (refresh) this.onRefresh();
  }

  // Services

  getCareers(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Career[]> {
    this.isLoadingGetCareers = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._careers = this.orderService.getCareers(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetCareers = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataCareers = data.data.meta; this.linksCareers = data.data.links; this.dataSourceCareers.data = data.data.items; res(data.data.items) },
        (e) => { this.handleErrors(e); rej(e) },
      )
    })
    return from(promise);
  }

  getYears() {
    this.isLoadingGetYears = true;
    const sort: Sort[] = [{ field: 'relation.name', sort: 'ASC' }]
    this._years = this.orderService.getYears(null, sort).subscribe(response => {
      this.years = response.data.items; console.log(this.years);
    }, e => {this.handleErrors(e); this.isLoadingGetYears = false}, () => this.isLoadingGetYears = false);
  }

  deleteCareer(careerId: string): Promise<void | Career> {
    return this.adminService.deleteCareer(careerId).toPromise().then(res => { this.onRefresh(); return res }).catch(error => {throw error})
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
