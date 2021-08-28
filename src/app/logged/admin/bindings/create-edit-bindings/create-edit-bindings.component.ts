import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/_services/admin.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';
import { Binding } from './../../../../_models/binding';

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
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  bindingForm: FormGroup;
  public readonly NAMES_FORM_POST_BINDING = {
    BINDING_NAME: 'name',
    BINDING_PRICE: 'price',
    BINDING_SHEETS_LIMIT: 'sheets_limit'
  };

  constructor(private adminService: AdminService, public router: Router, private formBuilder: FormBuilder, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService) { }

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
    },
    err => {this.handleErrors(err); this.isLoadingPostBinding = false},
    () => { this.isLoadingPostBinding = false; this.onCreated.emit() }
    );
  }

  patchBinding(bindingId: string) {
    this.isLoadingPostBinding = true;
    this.adminService.patchBinding(this.bindingForm.value, bindingId).subscribe(response => {
    }, err => this.handleErrors(err), () => { this.isLoadingPostBinding = false; this.onCreated.emit() });
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }
}
