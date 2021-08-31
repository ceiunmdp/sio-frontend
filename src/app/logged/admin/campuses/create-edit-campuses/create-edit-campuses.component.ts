import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Campus } from 'src/app/_models/campus';
import { AdminService } from 'src/app/_services/admin.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-create-edit-campuses',
  templateUrl: './create-edit-campuses.component.html',
  styleUrls: ['./create-edit-campuses.component.scss']
})
export class CreateEditCampusesComponent implements OnInit {
  @Input() campuses: Campus[];
  @Input() campus: Campus; // if this input is not null -> edit else -> create
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  isLoadingPostCampus = false;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  campusForm: FormGroup;
  public readonly NAMES_FORM_POST_CAMPUS = {
    CAMPUS_NAME: 'name',
  };

  constructor(private adminService: AdminService, public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.campusForm = this.createCampusForm(this.campus);
  }

  createCampusForm(campus?: Campus): FormGroup {
    const names = this.NAMES_FORM_POST_CAMPUS;

    return this.formBuilder.group({
      [names.CAMPUS_NAME]: [!!campus && !!campus.name ? campus.name : '', [CustomValidators.required("Nombre de sede requerido")]]
    });
  }

  onSubmitCampusForm() {
    !!this.campus ? this.patchCampus(this.campus.id) : this.postCampus();
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  // Services

  postCampus() {
    this.isLoadingPostCampus = true;
    this.adminService.postCampus(this.campusForm.value).subscribe(response => {
    }, e => {this.handleErrors(e);this.isLoadingPostCampus = false}, () => { this.isLoadingPostCampus = false; this.onCreated.emit() });
  }

  patchCampus(campusId: string) {
    this.isLoadingPostCampus = true;
    this.adminService.patchCampus(this.campusForm.value, campusId).subscribe(response => {
    }, e => {this.handleErrors(e);this.isLoadingPostCampus = false}, () => { this.isLoadingPostCampus = false; this.onCreated.emit() });
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
