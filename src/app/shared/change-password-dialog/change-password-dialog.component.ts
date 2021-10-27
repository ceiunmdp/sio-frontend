import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';
import { MyErrorStateMatcher } from 'src/app/logged/student/orders/components/files-config/files-config.component';
import { AdminService } from 'src/app/_services/admin.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

export const checkPasswordsValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const pass = control.get('password');
    const confirmPass = control.get('confirm_password')

    return pass && confirmPass && pass.value === confirmPass.value ? null : { notSame: true };
};

@Component({
  selector: 'cei-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit {

  changePasswordForm: FormGroup;
  public readonly PASSWORD = "password";
  public readonly CONFIRM_PASSWORD = "confirm_password";
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;
  isLoadingPatchUser = false;
  isSent = false;
  user;
  enablePassword = false;
  addedPassword = false;
  hide = true;
  matcher = new MyErrorStateMatcher();

  constructor(
    private adminService: AdminService,
    private authService: AuthenticationService,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private fb: FormBuilder,
    public router: Router,
    @Inject(MAT_DIALOG_DATA) public data: {userId: string, self: boolean},
    private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.changePasswordForm = this.createPasswordForm();
  }

  createPasswordForm() {
    return this.fb.group({
        [this.PASSWORD]: [{ value: '', disabled: false }, [CustomValidators.required("Contraseña requerida"), CustomValidators.password('La contraseña debe cumplir con lo siguiente: un mínimo de 8 caracteres, una mayúscula, un número y un caracter especial')]],
        [this.CONFIRM_PASSWORD]: []
    }, { validators: [checkPasswordsValidator], updateOn: 'change'});
  }

  onSubmit() {
    delete this.changePasswordForm.value.confirm_password;
    this.isLoadingPatchUser = true;
    if (this.data.self) {
        this.adminService.patchSelfUser(this.changePasswordForm.value).subscribe(response => {
        this.isLoadingPatchUser = false;
        this.isSent = true;
        this.authService.getAndUpdateUserData().toPromise()
        .then(() => {
          
        })
        .catch(err => {this.handleErrors(err); this.dialogRef.close(); this.isLoadingPatchUser = false})
        } , e => { this.handleErrors(e); this.dialogRef.close(); this.isLoadingPatchUser = false }) 
    } else {
        this.adminService.patchGenericUser(this.changePasswordForm.value, this.data.userId).subscribe(response => {
        this.isLoadingPatchUser = false;
        this.isSent = true;
        this.authService.getAndUpdateUserData().toPromise()
        .then(() => {
          
        })
        .catch(err => {this.handleErrors(err); this.dialogRef.close(); this.isLoadingPatchUser = false})
        } , e => { this.handleErrors(e); this.dialogRef.close(); this.isLoadingPatchUser = false }) 
    }

    
  }
  
  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
