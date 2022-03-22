import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/_services/admin.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { USER_TYPES } from 'src/app/_users/types';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-profile-dialog',
  templateUrl: './profile-dialog.component.html',
  styleUrls: ['./profile-dialog.component.scss']
})
export class ProfileDialogComponent implements OnInit {

  userForm: FormGroup;
  public readonly DNI = "dni";
  public readonly NAME = "display_name";
  public readonly EMAIL = "email";
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;
  isLoadingPatchUser = false;
  isSent = false;
  user;
  USER_TYPES = USER_TYPES;
  enablePassword = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthenticationService,
    public dialogRef: MatDialogRef<ProfileDialogComponent>,
    private fb: FormBuilder,
    public router: Router,
    private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
  ) {}

  ngOnInit() {
    this.user = this.authService.currentUserValue;
    this.userForm = this.createUserForm(this.user)(this.user.type);
  }

createUserForm(user) {
    const genericForm = this.fb.group({
      [this.NAME]: [{ value: !!user && !!user.display_name ? user.display_name : '', disabled: false }, [CustomValidators.required("Nombre de usuario requerido")]],
      [this.EMAIL]: [{ value: !!user && !!user.email ? user.email : '', disabled: true }, [CustomValidators.required("Email requerido"), CustomValidators.email('Formato de email inválido')]],
    });
    return (userType) => {
      const handleNotStudent = () => {
        return genericForm;
      }
      const handleStudent = () => {
        const specificForm = this.fb.group({
          ...genericForm.controls,
          [this.DNI]: [{ value: !!user && !!user.dni ? user.dni : '', disabled: false }, [CustomValidators.required("El valor es obligatorio, debe ser un valor mayor a 0")]]
        })
        return specificForm;
      }
      
      switch (userType) {
        case this.USER_TYPES.ADMIN:
        case this.USER_TYPES.CATEDRA:
        case this.USER_TYPES.SEDE:
          return handleNotStudent();
        case this.USER_TYPES.ESTUDIANTE:
          case this.USER_TYPES.BECADO:
          return handleStudent();
        default:
          break;
      }
    }
  }

  onSubmit(userType) {
    this.isLoadingPatchUser = true;
    if (userType === this.USER_TYPES.ESTUDIANTE || userType === this.USER_TYPES.BECADO) {
      this.adminService.patchStudent(this.userForm.value).subscribe(response => {
        this.isLoadingPatchUser = false;
        this.isSent = true;
        this.authService.getAndUpdateUserData().toPromise()
        .then(() => {
          
        })
        .catch(err => {this.handleErrors(err); this.dialogRef.close(); this.isLoadingPatchUser = false})
        } , e => {this.handleErrors(e); this.dialogRef.close(); this.isLoadingPatchUser = false}
      )
    } else {
        this.adminService.patchSelfUser(this.userForm.value).subscribe(response => {
        this.isLoadingPatchUser = false;
        this.isSent = true;
        this.authService.getAndUpdateUserData().toPromise()
        .then(() => {
          this.dialogRef.close();
        })
        .catch(err => {this.handleErrors(err); this.dialogRef.close(); this.isLoadingPatchUser = false})
        } , e => {this.handleErrors(e); this.dialogRef.close(); this.isLoadingPatchUser = false}
      )
    }
  }
  
  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }
}