import { Binding } from './../../../../_models/binding';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Career } from 'src/app/_models/orders/career';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { AdminService } from 'src/app/_services/admin.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-create-edit-bindings',
  templateUrl: './create-edit-bindings.component.html',
  styleUrls: ['./create-edit-bindings.component.scss']
})
export class CreateEditBindingsComponent implements OnInit {
  @Input() bindings: Binding[];
  @Input() binding: Binding; // if this input is not null -> edit else -> create
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  isLoadingPostBinding = false;

  bindingForm: FormGroup;
  public readonly NAMES_FORM_POST_BINDING = {
    BINDING_NAME: 'name',
    BINDING_PRICE: 'price',
    BINDING_SHEETS_LIMIT: 'sheets_limit'
  };

  constructor(private adminService: AdminService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.bindingForm = this.createBindingForm(this.binding);
  }

  createBindingForm(binding?: Binding): FormGroup {
    const names = this.NAMES_FORM_POST_BINDING;

    return this.formBuilder.group({
      [names.BINDING_NAME]: [!!binding && !!binding.name ? binding.name : '', [CustomValidators.required("Nombre del anillado requerido")]],
      [names.BINDING_PRICE]: [!!binding && !!binding.price ? binding.price : '', [CustomValidators.required("Precio del anillado requerido"), CustomValidators.minValue(0, "El precio debe ser mayor a 0")]],
      [names.BINDING_SHEETS_LIMIT]: [!!binding && !!binding.sheets_limit ? binding.sheets_limit : '', [CustomValidators.required("Límite de hojas del anillado requerido"), CustomValidators.minValue(0, "El valor debe ser mayor a 0")]]
    });
  }

  onSubmitBindingForm() {
    !!this.binding ? this.patchBinding(this.binding.id) : this.postBinding();
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  // Services

  postBinding() {
    this.isLoadingPostBinding = true;
    this.adminService.postBinding(this.bindingForm.value).subscribe(response => {
    }, e => console.log(e), () => { this.isLoadingPostBinding = false; this.onCreated.emit() });
  }

  patchBinding(bindingId: string) {
    this.isLoadingPostBinding = true;
    this.adminService.patchBinding(this.bindingForm.value, bindingId).subscribe(response => {
    }, e => console.log(e), () => { this.isLoadingPostBinding = false; this.onCreated.emit() });
  }
}
