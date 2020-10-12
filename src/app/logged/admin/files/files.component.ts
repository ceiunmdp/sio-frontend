import { Subject } from './../../../_models/subject';
import { AdminService } from './../../../_services/admin.service';
import { CustomValidators } from './../../../_validators/custom-validators';
import { HttpErrorResponseHandlerService } from './../../../_services/http-error-response-handler.service';
import { GeneralService } from './../../../_services/general.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';

export interface FileUpload {
  name: string;
  base64: string;
}

@Component({
  selector: 'cei-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})

export class FilesComponent implements OnInit {

  @ViewChild('myPond', {static: false}) myPond: any;
  public readonly SUBJECT = "subject";
  public readonly CAREER = "career";
  public readonly CAREER_SEARCHING = "career_searching";
  public readonly NAME = "name";
  public readonly ID = "id";
  public readonly FILES = "files";
  step: number;
  totalFiles: number;
  totalSubjects: number;
  selectedSubject: string;
  selectedCareer: string;
  filePage: number;
  subjectPage: number;
  dataSourceSubjects: any;
  dataSourceFiles: any;
  dataSourceCareers: any;
  messageError: any;
  selectedSubjects: any[];
  @ViewChild('alertError', { static: true }) alertError;
  public readonly TITLE = "Archivos";
  displayedColumns: string[];
  swalOptions: any;
  @ViewChild('responseSwal', { static: true }) private responseSwal: SwalComponent;

  pondOptions = {
    class: 'my-filepond',
    multiple: true,
    labelIdle: 'Arrastre los archivos o haga clic <strong>aquí</strong>',
    labelInvalidField: 'Archivo inválido',
    labelFileProcessing: 'Subiendo',
    labelFileLoadError: 'Error durante la subida',
    labelFileProcessingError: 'Error durante la subida',
    labelFileProcessingComplete: 'Carga completada',
    acceptedFileTypes: 'application/pdf'
  }


  filesForm: FormGroup;
  subjects: any[];
  careers: any[];
  files: Map<string, FileUpload> = new Map();
  subjectFilesEditForm: FormGroup;
  displayedColumnsFiles: string[];

  constructor(
      private formBuilder: FormBuilder,
      private adminService: AdminService,
      private generalService: GeneralService,
      public router: Router,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
  ) { }

  ngOnInit() {
    this.step = 0;
    this.selectedSubjects = new Array();
    this.displayedColumns = [
      "name",
      "actions"
    ];
    this.displayedColumnsFiles = [
      "name",
      "actions"
    ];
    this.generalService.sendMessage({ title: this.TITLE });
    this.filesForm = this.createFilesForm();
    this.getSubjects();
    this.getCareers();
  }

  createFilesForm(): FormGroup {
    return this.formBuilder.group({
      [this.SUBJECT]: ["", [CustomValidators.required("Materia requeridas")]],
      [this.CAREER]: [""],
      [this.CAREER_SEARCHING]: [""],
      [this.FILES]: ["", [CustomValidators.required("Archivos requeridos")]]
   });
  }

  applyFilter(filterValue: string) {
    this.dataSourceSubjects.filter = filterValue.trim().toLowerCase();
  }

  applyFilterFiles(filterValue: string) {
    this.dataSourceFiles.filter = filterValue.trim().toLowerCase();
  }

  getCareers() {
    this.adminService.getCareers().subscribe(
      careers => {
          this.careers = careers;
          this.dataSourceCareers = new MatTableDataSource(careers);
      },
      err => this.handleErrors(err)
    );
  }

  selectCareer(event) {
    console.log(event)
    this.selectedCareer = event.id;
    this.getSubjects(event.id);
  }

  getSubjects(careerId?: string, page?: number) {
    this.adminService.getSubjects(careerId, page).subscribe(
        (data) => {
          this.subjects = data.items;
          this.totalSubjects = data.meta.total_items
          this.selectedCareer = careerId; 
          this.dataSourceSubjects = new MatTableDataSource(data.items);
        },
        err => this.handleErrors(err)
    );
  }

  getSubjectsFiles(subjectId: any, page?: number) {
    this.selectedSubject = subjectId;
    this.adminService.getSubjectsFiles(subjectId, page).subscribe(
      (data) => {
        this.totalFiles = data.meta.total_items
        this.dataSourceFiles = new MatTableDataSource(data.items);
      },
      err => this.handleErrors(err)
    );
  }

  uploadFiles() {
    this.adminService.uploadFiles(this.selectedSubjects.join(","), Array.from(this.files.values())).subscribe(
      (message) => {
        this.swalOptions = {
          title: 'Carga exitosa',
          text: message.message,
          type: 'success',
          showConfirmButton: true,
          confirmButtonText: 'Continuar'
      };
      // TODO ver como evitar el setTimeout
      setTimeout(() => this.responseSwal.fire(), 0);
      this.backFrom1To0();
      },
      err => {
        this.handleErrors(err)
      }
    );
  }

  calculateIdSubject(element) {
    return element ? element.id : null;
  }

  calculateNameSubject(element) {
    return element ? element.name : null;
  }

  calculateIdCareer(element) {
    return element ? element.id : null;
  }

  calculateNameCareer(element) {
    return element ? element.name : null;
  }

  backFrom1To0() {
    this.step = 0;
    this.selectedSubjects = new Array();
    this.generalService.sendMessage({ title: this.TITLE })
    this.filesForm.reset();
    this.alertError.closeError();
  }

  backFrom2To0() {
    this.step = 2;
    this.subjectFilesEditForm.reset();
    this.alertError.closeError();
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
       this.alertError.openError(this.messageError);
    }
  }

  createSubjectFilesEditForm(subject): FormGroup {
    return this.formBuilder.group({
       [this.ID]: [subject.id, [CustomValidators.required("Id requerido")]],
       [this.NAME]: [
          subject.name,
          [CustomValidators.required("Nombre requerido")]
       ]
    });
  }

  onEditSubjectsFiles() {
    this.adminService
       .onEditSubjectsFiles(
          this.subjectFilesEditForm.get(this.ID).value,
          this.subjectFilesEditForm.get(this.NAME).value
       )
       .subscribe(
          message => {
             this.step = 0;
             this.swalOptions = {
                title: "Operación exitosa",
                text: message.message,
                type: "success",
                showConfirmButton: true,
                confirmButtonText: "Continuar"
             };
             // TODO ver como evitar el setTimeout
             setTimeout(() => this.responseSwal.fire(), 0);
             this.getCareers();
          },
          error => {
             this.handleErrors(error);
          }
       );
  }

  deleteFile(file: any) {
    this.adminService.deleteFile(file.id).subscribe(
      (message) => {
        this.swalOptions = {
          title: 'Borrado con éxito',
          text: message.message,
          type: 'success',
          showConfirmButton: true,
          confirmButtonText: 'Continuar'
      };
      // TODO ver como evitar el setTimeout
      setTimeout(() => this.responseSwal.fire(), 0);
      this.backFrom1To0();
      },
      err => {
        this.handleErrors(err)
      }
    );
  }

  displayEditSubjectFilesForm(subject) {
    this.subjectFilesEditForm = this.createSubjectFilesEditForm(subject);
    this.subjectFilesEditForm.get(this.ID).disable();
    this.step = 3;
  }

  displaySubjectFiles(subject) {
    this.generalService.sendMessage({ title: this.TITLE + " de " + subject.name })
    this.getSubjectsFiles(subject.id)
    this.step = 2;
  }

  addSubject(event) {
    this.selectedSubjects.push(event.id)
  }

  removeSubject(event) {
    this.selectedSubjects = this.selectedSubjects.filter(item => item !== event.value.id)
  }

  pageFileEvent(event) {
    this.getSubjectsFiles(this.selectedSubject, event.pageIndex + 1);
  }

  pageSubjectEvent(event) {
    this.getSubjects(this.selectedCareer, event.pageIndex + 1);
  }

}
