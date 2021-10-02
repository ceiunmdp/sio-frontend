import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Course } from 'src/app/_models/orders/course';
import { File } from 'src/app/_models/orders/file';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';
import Swal from 'sweetalert2';
import { AdminService } from '../../../_services/admin.service';
import { GeneralService } from '../../../_services/general.service';
import { OrdersService } from '../../../logged/student/orders/orders.service';

export interface FileUpload {
  name: string;
  base64: string;
}

enum STEPS {
  LIST_COURSES,
  LIST_FILES,
  ADD_FILES,
  EDIT
}

@Component({
  selector: 'cei-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})

export class FilesComponent implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('myPond', { static: false }) myPond: any;
  inputFilterValueCourses = ''
  inputFilterValueFiles = ''
  public readonly SUBJECT = "subject";
  public readonly CAREER = "career";
  public readonly CAREER_SEARCHING = "career_searching";
  public readonly FILES = "files";
  public STEPS = STEPS;
  step: STEPS;
  isLoadingGetCourses = false; _courses: Subscription;
  isLoadingGetFiles = false; _files: Subscription;
  selectedCourse: Course; // .. !null when edit button is clicked
  selectedFile: File; // .. !null when edit button is clicked
  dataSourceCourses: MatTableDataSource<Course>;
  dataSourceFiles: MatTableDataSource<File>;
  displayedColumnsCourses: string[] = [
    'courseName',
    'actions',
  ];
  displayedColumnsFiles: string[] = [
    'fileName',
    'actions',
  ];
  // metadata from api
  metaDataCourses: MetadataAPI;
  linksCourses: LinksAPI;
  metaDataFiles: MetadataAPI;
  linksFiles: LinksAPI;
  // metadata from ui
  paginationCourse: Pagination;
  paginationFile: Pagination;
  filterCourse: OR | AND;
  sortCourse: Sort[];
  filterFile: OR | AND;
  sortFile: Sort[];
  files: Map<string, FileUpload> = new Map();
  fb: FilterBuilder;
  public readonly TITLE = "Archivos";
  pondOptions = {
    class: 'my-filepond',
    multiple: true,
    labelIdle: 'Arrastre los archivos o haga clic <strong>aquí</strong>',
    labelFileTypeNotAllowed: 'Tipo de archivo inválido',
    fileValidateTypeLabelExpectedTypes: 'Formatos aceptados: pdf',
    acceptedFileTypes: 'application/pdf'
  }

  filesForm: FormGroup;
  messageError: string;
  selectedCourses: any[] = [];
  courses: any[] = [];
  @ViewChild('alertError', { static: true }) alertError;
  @ViewChild('responseSwal', { static: false }) private responseSwal: SwalComponent;

  constructor(public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,private formBuilder: FormBuilder, private adminService: AdminService, private orderService: OrdersService, public generalService: GeneralService) { }

  ngOnInit() {
    this.fb = new FilterBuilder();
    this.filterCourse = this.fb.and();
    this.step = STEPS.LIST_COURSES;
    this.generalService.sendMessage({ title: this.TITLE });
    this.sortCourse = [{ field: 'course.name', sort: "ASC" }]
    this.getCourses(this.filterCourse, this.sortCourse, this.paginationCourse);
    this.dataSourceCourses = new MatTableDataSource();
  }

  ngOnDestroy(): void {
    if (!!this._courses) this._courses.unsubscribe();
    if (!!this._files) this._files.unsubscribe();
  }

  onPaginatorEvent(event: PageEvent) {
    this.paginationCourse = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getCourses(this.filterCourse, this.sortCourse, this.paginationCourse);
  }

  onPaginatorFileEvent(event: PageEvent) {
    this.paginationFile = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getFiles(this.filterFile, this.sortFile, this.paginationFile);
  }

  onRefresh(): Promise<Course[]> {
    return this.getCourses(this.fb.and(), this.sortCourse, this.paginationCourse).toPromise();
  }

  onRefreshFiles(): Promise<File[]> {
    let filter = (!!this.selectedCourse) ? this.filterFile : this.fb.and()
    return this.getFiles(filter, this.sortFile, this.paginationFile).toPromise();
  }

  onSearchCourses(st: string) {
    this.filterCourse = this.fb.and(this.fb.where('course.name', OPERATORS.CONTAINS, st));
    this.getCourses(this.filterCourse)
  }

  onSearchFiles(st: string) {
    this.filterFile = this.fb.and(this.fb.where('file.name', OPERATORS.CONTAINS, st), this.fb.where('file_course.course_id', OPERATORS.IS, this.selectedCourse.id));
    this.getFiles(this.filterFile)
  }

  onClickEditFile(file: File) {
    this.selectedFile = file;
    this.step = this.STEPS.EDIT;
  }

  fromCreateOrEditToList(refresh = false) {
    this.step = this.STEPS.LIST_FILES;
    this.selectedFile = null; // Reset selectedFile
    if (refresh) this.onRefreshFiles();
  }

  // Services

  getCourses(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Course[]> {
    this.isLoadingGetCourses = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._courses = this.orderService.getCourses(filter, sort, pagination).pipe(
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

  selectCourseFiles(course) {
    this.generalService.sendMessage({ title: this.TITLE + " de " + course.name });
    this.selectedCourse = course;
    this.dataSourceFiles = new MatTableDataSource();
    this.sortFile = [{ field: 'file.name', sort: "ASC" }]
    this.filterFile = this.fb.and(this.fb.where('file_course.course_id', OPERATORS.IS, this.selectedCourse.id));
    this.getFiles(this.filterFile, this.sortCourse, this.paginationCourse)
  }


  getFiles(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<File[]> {
    this.isLoadingGetCourses = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._files = this.orderService.getFilesV2(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetCourses = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataFiles = data.data.meta; this.linksFiles = data.data.links; this.dataSourceFiles.data = data.data.items; res(data.data.items); this.step = this.STEPS.LIST_FILES;},
        (e) => { this.handleErrors(e); rej(e) },
      )
    })
    return from(promise);
  }

  getSubjectsFiles(subjectId: any): Observable<File[]> {
    this.isLoadingGetFiles = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this.adminService.getSubjectsFiles(subjectId).pipe(
        finalize(() => {
          this.isLoadingGetFiles = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataFiles = data.data.meta; this.linksFiles = data.data.links; this.dataSourceFiles.data = data.data.items; res(data.data.items); this.step = this.STEPS.LIST_FILES;},
        (e) => { this.handleErrors(e); rej(e) },
      )
    })
    return from(promise);
  }

  backToListCourses() {
    this.step = this.STEPS.LIST_COURSES;
    this.inputFilterValueFiles = '';
    this.inputFilterValueCourses = '';
    this.filterCourse = this.fb.and();
    this.selectedFile = null;
    this.selectedCourse = null;
    this.selectedCourses = [];
    this.generalService.sendMessage({ title: this.TITLE });
    this.onRefresh()
  }

  displayAddFiles() {
    this.step = this.STEPS.ADD_FILES
    this.files = new Map();
    this.filesForm = this.createFilesForm();
  }

  createFilesForm(): FormGroup {
    return this.formBuilder.group({
      [this.SUBJECT]: ["", [CustomValidators.required("Materia requeridas")]],
      [this.FILES]: ["", [CustomValidators.required("Archivos requeridos")]]
    });
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

  uploadFiles() {
    this.adminService.uploadFiles(this.selectedCourses.join(","), Array.from(this.files.values())).subscribe(
      (message) => {
        const swalOptions = {
          title: 'Carga exitosa',
          text: message.message,
          type: 'success',
          showConfirmButton: true,
          confirmButtonText: 'Continuar'
        };
        Swal.fire(swalOptions);
        this.backToListCourses();
      },
      err => {
        this.handleErrors(err)
      }
    );
  }

  onClickDelete(file: any) {
    Swal.fire({
      title: 'Eliminar archivo',
      text: `¿Seguro que desea eliminar el archivo: ${file.name}?`,
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return this.deleteFile(file).then((response) => {
          console.log(response);
          const swalOptions = {
            title: 'Borrado con éxito',
            type: 'success',
            showConfirmButton: true,
            confirmButtonText: 'Continuar'
          };
          Swal.fire(swalOptions);
          this.getFiles(this.filterFile, this.sortFile, this.paginationFile);
        }).catch(err => this.handleErrors(err))
      },
      allowOutsideClick: () => !Swal.isLoading()
    })
  }

  deleteFile(file: any) {
    return this.adminService.deleteFile(file.id).toPromise()
      .catch(err => this.handleErrors(err));
  }

  onSearchCoursesForFiles(event: any) {
    if (event.term.length >= 2) {
      this.filterCourse = this.fb.and(this.fb.where('course.name', OPERATORS.CONTAINS, event.term));
      this.getCourses(this.filterCourse)
      this.courses = this.dataSourceCourses.data;
    }
  }

  addCourse(event) {
    this.selectedCourses.push(event.id)
  }

  removeCourse(event) {
    this.selectedCourses = this.selectedCourses.filter(item => item !== event.value.id)
  }

}
