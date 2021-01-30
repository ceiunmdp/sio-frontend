import { CustomValidators } from './../../../../_validators/custom-validators';
import { FormBuilder } from '@angular/forms';
import { AdminService } from 'src/app/_services/admin.service';
import { FormGroup } from '@angular/forms';
import { Parameter } from './../../../../_models/parameter';
import { Input, Output, EventEmitter } from '@angular/core';
import { Component, OnInit } from '@angular/core';

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

  parameterForm: FormGroup;
  public readonly NAMES_FORM_PATCH_PARAMETER = {
    PARAMETER_VALUE: 'value',
  };

  constructor(private adminService: AdminService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.parameterForm = this.createParameterForm(this.parameter);
  }

  createParameterForm(parameter?: Parameter): FormGroup {
    const names = this.NAMES_FORM_PATCH_PARAMETER;

    return this.formBuilder.group({
      [names.PARAMETER_VALUE]: [!!parameter && !!parameter.value ? parameter.value : '', [CustomValidators.required("Valor del parámetro requerido"), CustomValidators.minLength(0, "El valor debe ser mayor a 0")]]
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
    this.adminService.patchParameter(this.parameterForm.value, parameterId).subscribe(response => {
      console.log(response);
    }, e => console.log(e), () => { this.isLoadingPatchParameter = false; this.onCreated.emit() });
  }

}
