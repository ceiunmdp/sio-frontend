import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { from, Observable, Subscription } from 'rxjs';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Pagination } from 'src/app/_models/pagination';
import { Relation } from 'src/app/_models/relation';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { AdminService } from 'src/app/_services/admin.service';
import { GeneralService } from 'src/app/_services/general.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { Sort } from 'src/app/_models/sort';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

enum STEPS {
  LIST,
  CREATE_OR_EDIT
}

@Component({
  selector: 'cei-relations',
  templateUrl: './relations.component.html',
  styleUrls: ['./relations.component.scss']
})
export class RelationsComponent implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  inputFilterValue = ''
  public STEPS = STEPS;
  step: STEPS;
  relations: Relation[]; isLoadingGetRelations = false; _relations: Subscription;
  selectedRelation: Relation; // .. !null when edit button is clicked 
  dataSourceRelations: MatTableDataSource<Relation>;
  displayedColumns: string[] = [
    'relationName',
    'relationValue',
    'actions',
  ];
  // metadata from api
  metaDataRelations: MetadataAPI;
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
    this.generalService.sendMessage({ title: 'Relaciones' })
    this.sort = [{ field: 'relation.name', sort: "ASC" }]
    this.getRelations(this.filter, this.sort, this.pagination);
    this.dataSourceRelations = new MatTableDataSource();
  }

  ngOnDestroy(): void {
    this._relations.unsubscribe();
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getRelations(this.filter, this.sort, this.pagination);
  }

  onRefresh(): Promise<Relation[]> {
    return this.getRelations(this.filter, this.sort, this.pagination).toPromise();
  }

  onSearch(st: string) {
    this.filter = this.fb.and(this.fb.where('relation.name', OPERATORS.CONTAINS, st.trim()));
    this.getRelations(this.filter)
  }

  onClickEditItem(relation: Relation) {
    this.selectedRelation = relation;
    this.step = STEPS.CREATE_OR_EDIT;
  }

  fromCreateOrEditToList(refresh = false) {
    this.step = STEPS.LIST;
    this.selectedRelation = null; // Reset selectedParameter
    if (refresh) this.onRefresh();
  }

  // Services

  getRelations(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Relation[]> {
    this.isLoadingGetRelations = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._relations = this.adminService.getRelations(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetRelations = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => {
           this.metaDataRelations = data.data.meta;
           this.linksItems = data.data.links;
           this.dataSourceRelations.data = data.data.items;
           res(this.dataSourceRelations.data) 
          },
        (e) => { this.handleErrors(e); rej(e) },
      )
    })
    return from(promise);
  }

  handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
      this.alertError.openError(this.messageError);
      }
  }
}
