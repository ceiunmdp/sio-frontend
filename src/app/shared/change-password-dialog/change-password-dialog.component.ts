import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/_services/admin.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit {

  changePasswordForm: FormGroup;
  public readonly PASSWORD = "password";
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;
  isLoadingPatchUser = false;
  isSent = false;
  user;
  enablePassword = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthenticationService,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private fb: FormBuilder,
    public router: Router,
    private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.changePasswordForm = this.createPasswordForm();
  }

  createPasswordForm() {
    return this.fb.group({
        [this.PASSWORD]: [{ value: '', disabled: false }, [CustomValidators.required("Contraseña requerida"), CustomValidators.password('La contraseña debe cumplir con lo siguiente: un mínimo de 8 caracteres, una mayúscula, un número y un caracter especial')]]
    });
  }

  onSubmit() {
    this.isLoadingPatchUser = true;
    this.adminService.patchUser(this.changePasswordForm.value).subscribe(response => {
      this.isLoadingPatchUser = false;
      this.isSent = true;
      this.authService.getAndUpdateUserData().toPromise()
      .then(() => {
        this.dialogRef.close();
      })
      .catch(err => {this.handleErrors(err); this.dialogRef.close(); this.isLoadingPatchUser = false})
      } , e => { this.handleErrors(e); this.dialogRef.close(); this.isLoadingPatchUser = false }) 
  }
  
  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
