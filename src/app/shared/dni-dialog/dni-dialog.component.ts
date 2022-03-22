import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/_services/admin.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

export interface DialogData {
  id: string;
  name: string;
}

@Component({
  selector: 'cei-dni-dialog',
  templateUrl: './dni-dialog.component.html',
  styleUrls: ['./dni-dialog.component.scss']
})
export class DniDialogComponent implements OnInit {

  dniForm: FormGroup;
  public readonly DNI = "dni";
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;
  isLoadingPatchStudent = false;
  isSent = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthenticationService,
    public dialogRef: MatDialogRef<DniDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    public router: Router,
    private httpErrorResponseHandlerService: HttpErrorResponseHandlerService

  ) {}

  ngOnInit() {
    this.dialogRef.disableClose = true;
    this.dniForm = this.createDniForm();
  }

  createDniForm(): FormGroup {
    return this.fb.group({
        [this.DNI]: ["", [CustomValidators.required("Ingrese su numero de DNI")]]
    });
  }

  onSubmit() {
    this.isLoadingPatchStudent = true;
    this.adminService.patchStudent(this.dniForm.value).subscribe(response => {
      this.isLoadingPatchStudent = false;
      this.isSent = true;
      this.authService.getAndUpdateUserData().toPromise()
      .then(() => {
        this.dialogRef.close();
      })
      .catch(err => {this.handleErrors(err); this.isLoadingPatchStudent = false})
      } , e => {this.handleErrors(e); this.isLoadingPatchStudent = false})
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }
}
