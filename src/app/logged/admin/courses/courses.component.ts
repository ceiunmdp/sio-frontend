import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Career } from 'src/app/_models/orders/career';
import { Course } from 'src/app/_models/orders/course';
import { Year } from 'src/app/_models/orders/year';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { AdminService } from 'src/app/_services/admin.service';
import { GeneralService } from 'src/app/_services/general.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import Swal from 'sweetalert2';
import { OrdersService } from '../../student/orders/orders.service';

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
  inputFilterValue = ''
  public STEPS = STEPS;
  step: STEPS;
  careers: Career[]; isLoadingGetCareers = false; _careers: Subscription;
  years: Year[]; isLoadingGetYears = false; _years: Subscription;
  selectedCourse: Course; // .. !null when edit button is clicked
  dataSourceCourses: MatTableDataSource<Course>; isLoadingGetCourses = false;
  displayedColumns: string[] = [
    'courseName',
    'careers',
    'actions',
  ];
  // metadata from api
  metaDataCourses: MetadataAPI;
  linksCourses: LinksAPI;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];
  fb: FilterBuilder;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  constructor(private adminService: AdminService, public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private orderService: OrdersService, public generalService: GeneralService) { }

  ngOnInit() {
    this.generalService.sendMessage({ title: 'Materias'})
    this.fb = new FilterBuilder();
    this.step = STEPS.LIST;
    this.sort = [{ field: 'course.name', sort: "ASC" }];
    this.pagination = { page: 0, limit: 25 }
    this.getCourses(this.filter, this.sort, this.pagination);
    this.dataSourceCourses = new MatTableDataSource();
    this.getCareers();
    this.getYears();
  }

  ngOnDestroy(): void {
    this._careers.unsubscribe();
    this._years.unsubscribe();
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getCourses(this.filter, this.sort, this.pagination);
  }

  onRefresh(): Promise<Course[]> {
    return this.getCourses(this.filter, this.sort, this.pagination).toPromise();
  }

  onSearch(st: string) {
    this.filter = this.fb.and(this.fb.where('course.name', OPERATORS.CONTAINS, st.trim()));
    this.getCourses(this.filter)
  }

  onClickEditCourse(course: Course) {
    this.selectedCourse = course;
    this.step = STEPS.CREATE_OR_EDIT;
  }

  onClickDeleteCourse(course: Course) {
    Swal.fire({
      title: `¿Seguro desea eliminar la materia ${course.name}?`,
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return this.deleteCourse(course.id).then(deletedCourse => {
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
    this.selectedCourse = null; // Reset selectedCourse
    if (refresh) this.onRefresh();
  }

  // Services

  getCareers() {
    this.isLoadingGetCareers = true;
    const filter = this.fb.and()
    const sort: Sort[] = [{ field: 'career.name', sort: 'ASC' }]
    this._careers = this.orderService.getCareers(null, sort).subscribe(response => {
      this.careers = response.data.items;
    }, e => {this.handleErrors(e); this.isLoadingGetCareers = false}, () => this.isLoadingGetCareers = false);
  }

  getYears() {
    this.isLoadingGetYears = true;
    const sort: Sort[] = [{ field: 'relation.name', sort: 'ASC' }]
    this._years = this.orderService.getYears(null, sort).subscribe(response => {
      this.years = response.data.items; console.log(this.years);
    }, e => { this.handleErrors(e); this.isLoadingGetYears = false }, () => this.isLoadingGetYears = false);
  }

  getCourses(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Course[]> {
    this.isLoadingGetCourses = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this.orderService.getCourses(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetCourses = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataCourses = data.data.meta; this.linksCourses = data.data.links; this.dataSourceCourses.data = data.data.items; res(data.data.items) },
        (e) => { this.handleErrors(e); rej(e) },
      )
    })
    return from(promise);
  }

  deleteCourse(courseId: string): Promise<void | Course> {
    return this.adminService.deleteCourse(courseId).toPromise().then(res => { this.onRefresh(); return res }).catch(err => {throw err})
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
