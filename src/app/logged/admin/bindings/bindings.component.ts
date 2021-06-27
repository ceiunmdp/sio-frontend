import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { AdminService } from 'src/app/_services/admin.service';
import { GeneralService } from 'src/app/_services/general.service';
import Swal from 'sweetalert2';
import { OrdersService } from '../../orders/orders.service';
import { Binding } from './../../../_models/binding';

enum STEPS {
  LIST,
  CREATE_OR_EDIT
}
@Component({
  selector: 'cei-bindings',
  templateUrl: './bindings.component.html',
  styleUrls: ['./bindings.component.scss']
})
export class BindingsComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  inputFilterValue = ''
  public STEPS = STEPS;
  step: STEPS;
  bindings: Binding[]; isLoadingGetBindings = false; _bindings: Subscription;
  selectedBinding: Binding; // .. !null when edit button is clicked 
  dataSourceBindings: MatTableDataSource<Binding>; isLoadingGetItems = false;
  displayedColumns: string[] = [
    'bindingName',
    'bindingPrice',
    'bindingSheetsLimit',
    'actions',
  ];
  // metadata from api
  metaDataItems: MetadataAPI;
  linksItems: LinksAPI;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];
  fb: FilterBuilder;

  constructor(private adminService: AdminService, private orderService: OrdersService, public generalService: GeneralService) { }

  ngOnInit() {
    this.fb = new FilterBuilder();
    this.step = STEPS.LIST;
    this.sort = [{ field: 'binding.sheets_limit', sort: "ASC" }]
    this.getBindings(this.filter, this.sort, this.pagination);
    this.dataSourceBindings = new MatTableDataSource();
  }

  ngOnDestroy(): void {
    this._bindings.unsubscribe();
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getBindings(this.filter, this.sort, this.pagination);
  }

  onRefresh(): Promise<Binding[]> {
    return this.getBindings(this.filter, this.sort, this.pagination).toPromise();
  }

  onSearch(st: string) {
    this.filter = this.fb.and(this.fb.where('binding.name', OPERATORS.CONTAINS, st));
    this.getBindings(this.filter)
  }

  onClickEditItem(binding: Binding) {
    this.selectedBinding = binding;
    this.step = STEPS.CREATE_OR_EDIT;
  }

  onClickDeleteBinding(binding: Binding) {
    Swal.fire({
      title: `¿Seguro desea eliminar el anillado ${binding.name}?`,
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return this.deleteBinding(binding.id).then(deletedBinding => {
          Swal.fire({
            text: 'Anillado borrado correctamente',
            icon: 'success'
          })
        }).catch(e => console.log('error', e))
      },
      allowOutsideClick: () => !Swal.isLoading()
    })
  }

  fromCreateOrEditToList(refresh = false) {
    this.step = STEPS.LIST;
    this.selectedBinding = null; // Reset selectedItem
    if (refresh) this.onRefresh();
  }

  // Services

  getBindings(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Binding[]> {
    this.isLoadingGetBindings = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._bindings = this.orderService.getBindings(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetBindings = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataItems = data.data.meta; this.linksItems = data.data.links; this.dataSourceBindings.data = data.data.items; res(data.data.items) },
        (e) => { rej(e) },
      )
    })
    return from(promise);
  }

  deleteBinding(bindingId: string): Promise<Binding> {
    return this.adminService.deleteBinding(bindingId).toPromise().then(res => { this.onRefresh(); return res })
  }
}
