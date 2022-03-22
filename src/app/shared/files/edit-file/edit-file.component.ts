import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { File } from 'src/app/_models/orders/file';
import { AdminService } from 'src/app/_services/admin.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-edit-file',
  templateUrl: './edit-file.component.html',
  styleUrls: ['./edit-file.component.scss']
})
export class EditFileComponent implements OnInit {
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;
  @Input() file!: File;
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  isLoadingPatchFile = false;

  fileForm: FormGroup;
  public readonly NAMES_FORM_PATCH_FILE = {
    FILE_NAME: 'name',
  };

  constructor(public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private adminService: AdminService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.fileForm = this.createFileForm(this.file);
  }

  createFileForm(file?: File): FormGroup {
    const names = this.NAMES_FORM_PATCH_FILE;

    return this.formBuilder.group({
      [names.FILE_NAME]: [!!file && !!file.name ? file.name : '', [CustomValidators.required("Nombre de archivo requerido")]]
    });
  }

  onSubmitFileForm() {
    this.patchFile(this.file.id);
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  // Services

  patchFile(fileId: string) {
    this.isLoadingPatchFile = true;
    this.adminService.patchFile(this.fileForm.value, fileId).subscribe(response => {
    }, e => {this.handleErrors(e); this.isLoadingPatchFile = false}, () => { this.isLoadingPatchFile = false; this.onCreated.emit() });
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }
}
