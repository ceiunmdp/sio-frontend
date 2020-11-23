import { CustomValidators } from './../../../../_validators/custom-validators';
import { Item } from 'src/app/_models/item';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { AdminService } from 'src/app/_services/admin.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-edit-item',
  templateUrl: './edit-item.component.html',
  styleUrls: ['./edit-item.component.scss']
})
export class EditItemComponent implements OnInit {
  @Input() items: Item[];
  @Input() item!: Item;
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  isLoadingPatchItem = false;

  itemForm: FormGroup;
  public readonly NAMES_FORM_PATCH_ITEM = {
    ITEM_PRICE: 'price',
  };

  constructor(private adminService: AdminService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.itemForm = this.createItemForm(this.item);
  }

  createItemForm(item?: Item): FormGroup {
    const names = this.NAMES_FORM_PATCH_ITEM;

    return this.formBuilder.group({
      [names.ITEM_PRICE]: [!!item && !!item.price ? item.price : '', [CustomValidators.required("Precio de artículo requerido"), CustomValidators.minLength(0, "El precio debe ser mayor a 0")]]
    });
  }

  onSubmitItemForm() {
    this.patchItem(this.item.id);
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  // Services

  patchItem(itemId: string) {
    this.isLoadingPatchItem = true;
    console.log('item form', this.itemForm.value)
    this.adminService.patchItem(this.itemForm.value, itemId).subscribe(response => {
      console.log(response);
    }, e => console.log(e), () => { this.isLoadingPatchItem = false; this.onCreated.emit() });
  }

}
