import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ParameterType } from 'src/app/_parameters/parameter-types';
import { AdminService } from 'src/app/_services/admin.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { Parameter } from './../../../../_models/parameter';
import { CustomValidators } from './../../../../_validators/custom-validators';

@Component({
  selector: 'cei-edit-parameter',
  templateUrl: './edit-parameter.component.html',
  styleUrls: ['./edit-parameter.component.scss']
})
export class EditParameterComponent implements OnInit {
  @Input() parameters: Parameter[];
  @Input() parameter!: Parameter;
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  isLoadingPatchParameter = false;

  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;
  parameterForm: FormGroup;
  public readonly NAMES_FORM_PATCH_PARAMETER = {
    PARAMETER_VALUE: 'value',
  };

  constructor(public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private adminService: AdminService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.parameterForm = this.createParameterForm(this.parameter);
  }

  createParameterForm(parameter?: Parameter): FormGroup {
    const names = this.NAMES_FORM_PATCH_PARAMETER;

    if (parameter.code === ParameterType.USERS_MINIMUM_BALANCE_ALLOWED) {
      return this.formBuilder.group({
        [names.PARAMETER_VALUE]: [!!parameter && !!parameter.value ? parameter.value : '', [CustomValidators.minLength(0, "Valor del parámetro requerido")]]
      });
    }

    return this.formBuilder.group({
      [names.PARAMETER_VALUE]: [!!parameter && !!parameter.value ? parameter.value : '', [CustomValidators.minLength(0, "Valor del parámetro requerido"), CustomValidators.minValue(0, "El valor debe ser mayor a 0")]]
    });
  }

  onSubmitItemForm() {
    this.patchParameter(this.parameter.id);
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  // Services

  patchParameter(parameterId: string) {
    this.isLoadingPatchParameter = true;
    let value = this.parameterForm.value.value
    if (this.parameter.code === ParameterType.USERS_PROFESSORSHIPS_INITIAL_AVAILABLE_STORAGE || this.parameter.code === ParameterType.FILES_MAX_SIZE_ALLOWED)  {
        value = this.megaBytesToBytes(this.parameterForm.value.value)
    }
    this.adminService.patchParameter({value : value}, parameterId).subscribe(response => {
    }, e => {this.handleErrors(e); this.isLoadingPatchParameter = false }, () => { this.isLoadingPatchParameter = false; this.onCreated.emit() });
  }

  
  megaBytesToBytes(megaBytes) { 
    return megaBytes * (1024*1024);
  }

  handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
        this.alertError.openError(this.messageError);
      }
  }  
}
