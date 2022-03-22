import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Campus } from 'src/app/_models/campus';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { AdminService } from 'src/app/_services/admin.service';
import { GeneralService } from 'src/app/_services/general.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import Swal from 'sweetalert2';

enum STEPS {
  LIST,
  CREATE_OR_EDIT
}

@Component({
  selector: 'cei-campuses',
  templateUrl: './campuses.component.html',
  styleUrls: ['./campuses.component.scss']
})
export class CampusesComponent implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  inputFilterValue = ''
  public STEPS = STEPS;
  step: STEPS;
  campuses: Campus[]; isLoadingGetCampuses = false; _campuses: Subscription;
  selectedCampus: Campus; // .. !null when edit button is clicked 
  dataSourceCampuses: MatTableDataSource<Campus>; /*isLoadingGetCareers = false;*/
  displayedColumns: string[] = [
    'campusName',
    'actions',
  ];
  // metadata from api
  metaDataCampuses: MetadataAPI;
  linksCampuses: LinksAPI;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];
  fb: FilterBuilder;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  constructor(private adminService: AdminService, public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, public generalService: GeneralService) { }

  ngOnInit() {
    this.generalService.sendMessage({ title: 'Sedes'})
    this.fb = new FilterBuilder();
    this.step = STEPS.LIST;
    this.sort = [{ field: 'campus.name', sort: "ASC" }]
    this.getCampuses(this.filter, this.sort, this.pagination);
    this.dataSourceCampuses = new MatTableDataSource();
  }

  ngOnDestroy(): void {
    this._campuses.unsubscribe();
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getCampuses(this.filter, this.sort, this.pagination);
  }

  onRefresh(): Promise<Campus[]> {
    return this.getCampuses(this.filter, this.sort, this.pagination).toPromise();
  }

  onSearch(st: string) {
    this.filter = this.fb.and(this.fb.where('campus.name', OPERATORS.CONTAINS, st.trim()));
    this.getCampuses(this.filter)
  }

  onClickEditCampus(campus: Campus) {
    this.selectedCampus = campus;
    this.step = STEPS.CREATE_OR_EDIT;
  }

  onClickDeleteCampus(campus: Campus) {
    Swal.fire({
      title: `¿Seguro desea eliminar la sede ${campus.name}?`,
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return this.deleteCampus(campus.id).then(deletedCampus => {
          Swal.fire({
            text: 'Sede borrada correctamente',
            icon: 'success'
          })
        }).catch(e => this.handleErrors(e))
      },
      allowOutsideClick: () => !Swal.isLoading()
    })
  }

  fromCreateOrEditToList(refresh = false) {
    this.step = STEPS.LIST;
    this.selectedCampus = null; // Reset selectedCampus
    if (refresh) this.onRefresh();
  }

  // Services

  getCampuses(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Campus[]> {
    this.isLoadingGetCampuses = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._campuses = this.adminService.getCampuses(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetCampuses = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataCampuses = data.data.meta; this.linksCampuses = data.data.links; this.dataSourceCampuses.data = data.data.items; res(data.data.items) },
        (e) => { this.handleErrors(e); rej(e) },
      )
    })
    return from(promise);
  }

  deleteCampus(campusId: string): Promise<void | Campus> {
    return this.adminService.deleteCampus(campusId).toPromise().then(res => { this.onRefresh(); return res }).catch(error => {throw error})
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
