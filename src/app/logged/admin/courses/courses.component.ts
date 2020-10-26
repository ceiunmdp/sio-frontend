import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Career } from 'src/app/_models/orders/career';
import { Course } from 'src/app/_models/orders/course';
import { Year } from 'src/app/_models/orders/year';
import { Sort } from 'src/app/_models/sort';
import { OrdersService } from '../../orders/orders.service';
import { MetadataAPI, LinksAPI } from 'src/app/_models/response-api';
import { Pagination } from 'src/app/_models/pagination';
import { AND, OR } from 'src/app/_helpers/filterBuilder';
import { GeneralService } from 'src/app/_services/general.service';

enum STEPS {
  LIST,
  CREATE_OR_EDIT
}
@Component({
  selector: 'cei-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

  public STEPS = STEPS;
  step: STEPS;
  careers: Career[]; isLoadingGetCareers = false; _careers: Subscription;
  years: Year[]; isLoadingGetYears = false; _years: Subscription;
  selectedCourse: Course; // .. !null when edit button is clicked 
  dataSourceCourses: MatTableDataSource<Course>; isLoadingGetCourses = false;
  displayedColumns: string[] = [
    'courseId',
    'courseName',
    'actions',
  ];
  // metadata from api
  metaDataCourses: MetadataAPI;
  linksCourses: LinksAPI;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];

  constructor(private orderService: OrdersService, public generalService: GeneralService) { }

  ngOnInit() {
    this.step = STEPS.LIST;
    this.getCourses().subscribe(courses => this.dataSourceCourses.data = courses);
    this.dataSourceCourses = new MatTableDataSource();
    this.getCareers();
    this.getYears();
  }

  ngOnDestroy(): void {
    this._careers.unsubscribe();
    this._years.unsubscribe();
  }

  setDataSourceAttributes() {
    if (this.paginator != null && this.paginator != undefined) {
      this.paginator.pageIndex = this.metaDataCourses.current_page - 1;
      this.paginator.pageSize = this.metaDataCourses.items_per_page;
      this.paginator.length = this.metaDataCourses.total_items;
      this.paginator._intl.itemsPerPageLabel = 'Registros por página';
      this.paginator._intl.firstPageLabel = 'Primera página';
      this.paginator._intl.lastPageLabel = 'Última páginaa';
      this.paginator._intl.nextPageLabel = 'Página siguiente';
      this.paginator._intl.previousPageLabel = 'Página anterior';
    }
  }

  onPaginatorEvent() {
    this.pagination = { limit: this.paginator.pageSize, page: this.paginator.pageIndex + 1 }
    this.getCourses(this.filter, this.sort, this.pagination).subscribe(courses => this.dataSourceCourses.data = courses);
  }

  onRefresh(): Promise<Course[]> {
    return this.getCourses(this.filter, this.sort, this.pagination).toPromise().then(courses => this.dataSourceCourses.data = courses);
  }

  onClickEditCourse(course: Course) {
    this.selectedCourse = course;
    this.step = STEPS.CREATE_OR_EDIT;
  }

  fromCreateOrEditToList() {
    this.step = STEPS.LIST;
    this.selectedCourse = null; // Reset selectedCourse
    this.onRefresh().then(_ => {
      setTimeout(() => {
        this.setDataSourceAttributes()
      }, 300);
    })
  }

  // Services

  getCareers() {
    this.isLoadingGetCareers = true;
    const sort: Sort[] = [{ field: 'career.name', sort: 'ASC' }]
    this._careers = this.orderService.getCareers(null, sort).subscribe(response => {
      this.careers = response.data.items; console.log(this.careers);
    }, e => console.log(e), () => this.isLoadingGetCareers = false);
  }

  getYears() {
    this.isLoadingGetYears = true;
    const sort: Sort[] = [{ field: 'relation.name', sort: 'ASC' }]
    this._years = this.orderService.getYears(null, sort).subscribe(response => {
      this.years = response.data.items; console.log(this.years);
    }, e => console.log(e), () => this.isLoadingGetYears = false);
  }

  getCourses(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Course[]> {
    this.isLoadingGetCourses = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this.orderService.getCourses(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetCourses = false; setTimeout(() => {
            this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataCourses = data.data.meta; this.linksCourses = data.data.links; res(data.data.items) },
        (e) => { rej(e) },
      )
    })
    return from(promise);
  }
}
