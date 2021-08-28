import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Career } from 'src/app/_models/orders/career';
import { AdminService } from 'src/app/_services/admin.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-create-edit-career',
  templateUrl: './create-edit-career.component.html',
  styleUrls: ['./create-edit-career.component.scss']
})
export class CreateEditCareerComponent implements OnInit {
  @Input() careers: Career[];
  @Input() career: Career; // if this input is not null -> edit else -> create
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  isLoadingPostCareer = false;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  careerForm: FormGroup;
  public readonly NAMES_FORM_POST_CAREER = {
    CAREER_NAME: 'name',
  };

  constructor(private adminService: AdminService, public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.careerForm = this.createCareerForm(this.career);
  }

  createCareerForm(career?: Career): FormGroup {
    const names = this.NAMES_FORM_POST_CAREER;

    return this.formBuilder.group({
      [names.CAREER_NAME]: [!!career && !!career.name ? career.name : '', [CustomValidators.required("Nombre de carrera requerido")]]
    });
  }

  onSubmitCareerForm() {
    !!this.career ? this.patchCareer(this.career.id) : this.postCareer();
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  // Services

  postCareer() {
    this.isLoadingPostCareer = true;
    this.adminService.postCareer(this.careerForm.value).subscribe(response => {
    }, e => {this.handleErrors(e);this.isLoadingPostCareer = false}, () => { this.isLoadingPostCareer = false; this.onCreated.emit() });
  }

  patchCareer(careerId: string) {
    this.isLoadingPostCareer = true;
    this.adminService.patchCareer(this.careerForm.value, careerId).subscribe(response => {
    }, e => {this.handleErrors(e);this.isLoadingPostCareer = false}, () => { this.isLoadingPostCareer = false; this.onCreated.emit() });
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
