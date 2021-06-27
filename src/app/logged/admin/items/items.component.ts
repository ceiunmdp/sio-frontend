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
import { OrdersService } from '../../orders/orders.service';
import { Item } from './../../../_models/item';

enum STEPS {
  LIST,
  CREATE_OR_EDIT
}
@Component({
  selector: 'cei-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  inputFilterValue = ''
  public STEPS = STEPS;
  step: STEPS;
  items: Item[]; isLoadingGetItems = false; _items: Subscription;
  selectedItem: Item; // .. !null when edit button is clicked 
  dataSourceItems: MatTableDataSource<Item>; /*isLoadingGetItems = false;*/
  displayedColumns: string[] = [
    'itemName',
    'itemPrice',
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
    this.filter = this.fb.and(this.fb.where('item.type', OPERATORS.IS, 'Item'))
    this.step = STEPS.LIST;
    this.sort = [{ field: 'name', sort: "ASC" }]
    this.getItems(this.filter, this.sort, this.pagination);
    this.dataSourceItems = new MatTableDataSource();
  }

  ngOnDestroy(): void {
    this._items.unsubscribe();
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getItems(this.filter, this.sort, this.pagination);
  }

  onRefresh(): Promise<Item[]> {
    return this.getItems(this.filter, this.sort, this.pagination).toPromise();
  }

  onSearch(st: string) {
    this.filter = this.fb.and(this.fb.where('item.name', OPERATORS.CONTAINS, st));
    this.getItems(this.filter)
  }

  onClickEditItem(item: Item) {
    this.selectedItem = item;
    this.step = STEPS.CREATE_OR_EDIT;
  }

  // onClickDeleteItem(item: Item) {
  //   Swal.fire({
  //     title: `¿Seguro desea eliminar la materia ${item.name}?`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     reverseButtons: true,
  //     confirmButtonColor: '#d33',
  //     confirmButtonText: 'Eliminar',
  //     cancelButtonText: 'Cancelar',
  //     showLoaderOnConfirm: true,
  //     preConfirm: () => {
  //       return this.deleteItem(item.id).then(deletedItem => {
  //         Swal.fire({
  //           text: 'Materia borrada correctamente',
  //           icon: 'success'
  //         })
  //       }).catch(e => console.log('error', e))
  //     },
  //     allowOutsideClick: () => !Swal.isLoading()
  //   })
  // }

  fromCreateOrEditToList(refresh = false) {
    this.step = STEPS.LIST;
    this.selectedItem = null; // Reset selectedItem
    if (refresh) this.onRefresh();
  }

  // Services

  getItems(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Item[]> {
    this.isLoadingGetItems = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._items = this.orderService.getItems(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetItems = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataItems = data.data.meta; this.linksItems = data.data.links; this.dataSourceItems.data = data.data.items; res(data.data.items) },
        (e) => { rej(e) },
      )
    })
    return from(promise);
  }

  // deleteItem(itemId: string): Promise<Item> {
  //   return this.adminService.deleteItem(itemId).toPromise().then(res => { this.onRefresh(); return res })
  // }
}
