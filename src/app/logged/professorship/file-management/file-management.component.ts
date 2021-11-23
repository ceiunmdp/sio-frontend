import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { File } from 'src/app/_models/orders/file';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { User } from 'src/app/_models/users/user';
import { AdminService } from 'src/app/_services/admin.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { GeneralService } from 'src/app/_services/general.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';
import Swal from 'sweetalert2';
import { OrdersService } from '../../student/orders/orders.service';

export interface FileUpload {
  name: string;
  base64: string;
}

enum STEPS {
  LIST_FILES,
  ADD_FILES,
  EDIT
}

@Component({
  selector: 'cei-file-management',
  templateUrl: './file-management.component.html',
  styleUrls: ['./file-management.component.scss']
})
export class FileManagementComponent implements OnInit {

  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild('myPond', { static: false }) myPond: any;
  inputFilterValueCourses = ''
  inputFilterValueFiles = ''
  public readonly SUBJECT = "subject";
  public readonly FILES = "files";
  public STEPS = STEPS;
  step: STEPS;
  isLoadingGetFiles = false; _files: Subscription;
  selectedFile: File; // .. !null when edit button is clicked
  dataSourceFiles: MatTableDataSource<File>;
  displayedColumnsFiles: string[] = [
    'fileName',
    'pages',
    'actions',
  ];
  // metadata from api
  metaDataFiles: MetadataAPI;
  linksFiles: LinksAPI;
  // metadata from ui
  paginationFile: Pagination;
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
  user: User;
  filesForm: FormGroup;
  messageError: string;
  @ViewChild('alertError', { static: true }) alertError;
  @ViewChild('responseSwal', { static: false }) private responseSwal: SwalComponent;

  constructor(public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,
    private formBuilder: FormBuilder, private adminService: AdminService,
    private orderService: OrdersService, public generalService: GeneralService,
    private authService:AuthenticationService
  ) { }

  ngOnInit() {
    this.fb = new FilterBuilder();
    this.user = this.authService.currentUserValue
    this.filterFile;
    this.generalService.sendMessage({ title: this.TITLE + ' de ' + this.user.course.name });
    this.sortFile = [{ field: 'file.name', sort: "ASC" }]
    this.dataSourceFiles = new MatTableDataSource();
    this.getFiles(this.filterFile, this.sortFile, this.paginationFile);
  }

  ngOnDestroy(): void {
    this._files.unsubscribe();
  }

  backToListFiles() {
    this.step = this.STEPS.LIST_FILES;
    this.filesForm = null;
  }

  onPaginatorFileEvent(event: PageEvent) {
    this.paginationFile = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getFiles(this.filterFile, this.sortFile, this.paginationFile);
  }

  onRefreshFiles(): Promise<File[]> {
    return this.getFiles(this.filterFile, this.sortFile, this.paginationFile).toPromise();
  }

  onSearchFiles(st: string) {
    this.filterFile = this.fb.and(this.fb.where('file.name', OPERATORS.CONTAINS, st.trim()));
    this.getFiles(this.filterFile, this.sortFile, this.paginationFile)
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

  openFile(file) {
    file.isLoading = true;
    this.orderService.getFile(file.id).subscribe(
      (blob: any) => {
        var fileURL: any = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = fileURL;
        a.target = '_blank';
        a.click();
      },
      error => { this.handleErrors(error) },
      () => file.isLoading = false
    );
  }

  getFiles(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<File[]> {
    this.isLoadingGetFiles = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._files = this.orderService.getOwnFiles(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetFiles = false; setTimeout(() => {
            // this.setDataSourceAttributes();
          }, 400)
        })
      ).subscribe(
        (data) => { this.metaDataFiles = data.data.meta; this.linksFiles = data.data.links; this.dataSourceFiles.data = data.data.items; res(data.data.items); this.step = this.STEPS.LIST_FILES;},
        (e) => { rej(e) },
      )
    })
    return from(promise);
  }

  displayAddFiles() {
    this.step = this.STEPS.ADD_FILES
    this.filesForm = this.createFilesForm();
  }

  createFilesForm(): FormGroup {
    return this.formBuilder.group({
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
    this.adminService.uploadFiles(this.user.course.id, Array.from(this.files.values())).subscribe(
      (message) => {
        const swalOptions = {
          title: 'Carga exitosa',
          text: message.message,
          type: 'success',
          showConfirmButton: true,
          confirmButtonText: 'Continuar'
        };
        Swal.fire(swalOptions)
        .then(() => {
          this.authService.getAndUpdateUserData().toPromise()
          this.onRefreshFiles();
        });

      },
      err => {
        this.handleErrors(err)
      }
    );
  }

  deleteFile(file: any) {
    this.adminService.deleteFile(file.id).subscribe(
      (message) => {
        const swalOptions = {
          title: 'Borrado con éxito',
          text: message.message,
          type: 'success',
          showConfirmButton: true,
          confirmButtonText: 'Continuar'
        };
        Swal.fire(swalOptions)
        .then(() => {
          this.authService.getAndUpdateUserData().toPromise()
          this.onRefreshFiles();
        });
      },
      err => {
        this.handleErrors(err)
      }
    );
  }

}
