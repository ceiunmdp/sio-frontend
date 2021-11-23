import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { ParameterType } from 'src/app/_parameters/parameter-types';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { AND, FilterBuilder, OPERATORS, OR } from './../../../_helpers/filterBuilder';
import { Pagination } from './../../../_models/pagination';
import { Parameter } from './../../../_models/parameter';
import { AdminService } from './../../../_services/admin.service';
import { GeneralService } from './../../../_services/general.service';

enum STEPS {
  LIST,
  CREATE_OR_EDIT
}

@Component({
  selector: 'cei-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss']
})
export class ParametersComponent implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  inputFilterValue = ''
  public STEPS = STEPS;
  step: STEPS;
  parameters: Parameter[]; isLoadingGetParameters = false; _parameters: Subscription;
  selectedParameter: Parameter; // .. !null when edit button is clicked 
  dataSourceParameters: MatTableDataSource<Parameter>; /*isLoadingGetParameters = false;*/
  displayedColumns: string[] = [
    'parameterName',
    'parameterValue',
    'actions',
  ];
  // metadata from api
  metaDataParameters: MetadataAPI;
  linksItems: LinksAPI;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];
  fb: FilterBuilder;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;
  constructor(public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private adminService: AdminService, public generalService: GeneralService) { }

  ngOnInit() {
    this.fb = new FilterBuilder();
    this.step = STEPS.LIST;
    this.generalService.sendMessage({ title: 'Paramétricas' })
    this.sort = [{ field: 'name', sort: "ASC" }]
    this.getParameters(this.filter, this.sort, this.pagination);
    this.dataSourceParameters = new MatTableDataSource();
  }

  ngOnDestroy(): void {
    this._parameters.unsubscribe();
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getParameters(this.filter, this.sort, this.pagination);
  }

  onRefresh(): Promise<Parameter[]> {
    return this.getParameters(this.filter, this.sort, this.pagination).toPromise();
  }

  onSearch(st: string) {
    this.filter = this.fb.and(this.fb.where('parameter.name', OPERATORS.CONTAINS, st.trim()));
    this.getParameters(this.filter)
  }

  onClickEditItem(parameter: Parameter) {
    this.selectedParameter = parameter;
    console.log('paramter selected', parameter);
    this.step = STEPS.CREATE_OR_EDIT;
  }

  fromCreateOrEditToList(refresh = false) {
    this.step = STEPS.LIST;
    this.selectedParameter = null; // Reset selectedParameter
    if (refresh) this.onRefresh();
  }

  // Services

  getParameters(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Parameter[]> {
    this.isLoadingGetParameters = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._parameters = this.adminService.getParameters(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetParameters = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => {
           this.metaDataParameters = data.data.meta;
           this.linksItems = data.data.links;
           this.dataSourceParameters.data = data.data.items;
           // convert to MB
           this.dataSourceParameters.data = data.data.items.map(parameter => {
              if (parameter.code == ParameterType.USERS_PROFESSORSHIPS_INITIAL_AVAILABLE_STORAGE || parameter.code == ParameterType.FILES_MAX_SIZE_ALLOWED)  {
                parameter.value = this.bytesToMegaBytes(parameter.value)
                parameter.name += ' (tamaño expresado en MB)'
              }
              return parameter
           })
           res(this.dataSourceParameters.data) 
          },
        (e) => { this.handleErrors(e); rej(e) },
      )
    })
    return from(promise);
  }

  bytesToMegaBytes(bytes) { 
    return bytes / (1024*1024);
  }

  handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
      this.alertError.openError(this.messageError);
      }
  }
}
