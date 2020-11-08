import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MetadataAPI } from 'src/app/_models/response-api';
import { PageEvent, MatPaginator } from '@angular/material';

@Component({
  selector: 'cei-card-table',
  templateUrl: './card-table.component.html',
  styleUrls: ['./card-table.component.scss']
})
export class CardTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @Input() title: string;
  @Input() showPaginator: boolean = true;
  @Input() metaData: MetadataAPI;
  @Output('page') onPage = new EventEmitter<PageEvent>();

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.setDataSourceAttributes();
  }

  onPaginatorEvent(ev: PageEvent) {
    this.onPage.emit(ev)
  }

  setDataSourceAttributes() {
    if (!!this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Registros por página';
      this.paginator._intl.firstPageLabel = 'Primera página';
      this.paginator._intl.lastPageLabel = 'Última página';
      this.paginator._intl.nextPageLabel = 'Página siguiente';
      this.paginator._intl.previousPageLabel = 'Página anterior';
    }
  }

}
