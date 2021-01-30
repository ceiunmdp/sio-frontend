import { finalize } from 'rxjs/operators';
import { GeneralService } from './../../../_services/general.service';
import { AdminService } from './../../../_services/admin.service';
import { Sort } from 'src/app/_models/sort';
import { AND, OR, FilterBuilder, OPERATORS } from './../../../_helpers/filterBuilder';
import { Pagination } from './../../../_models/pagination';
import { MetadataAPI, LinksAPI } from 'src/app/_models/response-api';
import { Parameter } from './../../../_models/parameter';
import { ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { from, Observable, Subscription } from 'rxjs';

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

  constructor(private adminService: AdminService, public generalService: GeneralService) { }

  ngOnInit() {
    this.fb = new FilterBuilder();
    this.filter = this.fb.and();
    this.step = STEPS.LIST;
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
    this.filter = this.fb.and(this.fb.where('parameter.name', OPERATORS.CONTAINS, st));
    this.getParameters(this.filter)
  }

  onClickEditItem(parameter: Parameter) {
    this.selectedParameter = parameter;
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
      this.adminService.getParameters(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetParameters = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataParameters = data.data.meta; this.linksItems = data.data.links; this.dataSourceParameters.data = data.data.items; res(data.data.items) },
        (e) => { rej(e) },
      )
    })
    return from(promise);
  }

}
