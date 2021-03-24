import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, AbstractControl, FormControl, Validators, FormGroupDirective, NgForm, ValidatorFn } from '@angular/forms';
import { _File } from '../files/files.component';
import { CustomValidators } from 'src/app/_validators/custom-validators';
import { ErrorStateMatcher } from '@angular/material';
import { OrdersService } from '../../orders.service';
import { Subscription } from 'rxjs';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    // return form.form.invalid;
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

export interface _OnDataChange {
  completed: boolean,
  data: any //Completar
}

enum OPTIONS_RANGE_ENUM {
  ALL = '1',
  CUSTOM = '2'
}

@Component({
  selector: 'cei-files-config',
  templateUrl: './files-config.component.html',
  styleUrls: ['./files-config.component.scss']
})
export class FilesConfigComponent implements OnInit {
  @Input() files: _File[] = [];
  @Output('onDataChange') data: EventEmitter<_OnDataChange> = new EventEmitter(null);

  matcher = new MyErrorStateMatcher();
  configForm: FormGroup;
  _configFormValueChanges: Subscription;
  OPTIONS_RANGE_ENUM = OPTIONS_RANGE_ENUM;
  public readonly FILES = 'files' // Form array ppal
  public readonly FILE = 'file'
  public readonly FILE_ID = 'file_id'
  public readonly COPIES = 'copies'
  public readonly IS_SAME_CONFIG = 'same_config'
  public readonly CONFIGURATIONS = 'configurations' //Form array
  public readonly COLOUR = 'colour'
  public readonly DOUBLE_SIDED = 'double_sided'
  public readonly RANGE = 'range'
  public readonly OPTIONS_RANGE = 'options_range'
  public readonly SLIDES_PER_SHEET = 'slides_per_sheet'

  slides_per_sheet = [
    {
      value: 1
    },
    {
      value: 2
    },
    {
      value: 4
    },
    {
      value: 6
    }
  ];

  options_range = [
    {
      id: OPTIONS_RANGE_ENUM.ALL,
      name: 'Todas'
    },
    {
      id: OPTIONS_RANGE_ENUM.CUSTOM,
      name: 'Personalizado'
    }
  ];

  constructor(private formBuilder: FormBuilder, public orderService: OrdersService) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (!!this.files && this.files.length > 0) {
      this.configForm = this.createConfigForm();
      if (!!this._configFormValueChanges) {
        this._configFormValueChanges.unsubscribe();
      }
      this._configFormValueChanges = this.configForm.valueChanges.subscribe(form => {
        const completed = this.configForm.valid;
        this.data.emit({ completed, data: form })
      });
    }
  }

  get filesItemFormArray(): FormArray {
    return this.configForm.get(this.FILES) as FormArray;
  }

  getconfigsFormArray(fileItemIndex: number): FormArray {
    return this.configForm.get(this.FILES)['controls'][fileItemIndex].get(this.CONFIGURATIONS) as FormArray;
  }

  createConfigForm(): FormGroup {
    // Create as many forms as there are files
    const createFilesItemByFiles = (): FormGroup[] => {
      console.log(this);
      const forms: FormGroup[] = [];
      this.files.forEach(file => forms.push(this.createFileItemForm(file)))
      return forms;
    }

    return this.formBuilder.group({
      [this.FILES]: this.formBuilder.array(createFilesItemByFiles())
    });
  }

  createFileItemForm(file?: _File): FormGroup {
    return this.formBuilder.group({
      [this.FILE_ID]: [file.id],
      [this.FILE]: [file],
      [this.COPIES]: [1],
      [this.IS_SAME_CONFIG]: [true],
      [this.CONFIGURATIONS]: this.formBuilder.array([this.createConfigItemForm(file)]),
    })
  }

  createConfigItemForm(file: _File, value?): FormGroup {
    const quantityPagesFile = file.number_of_sheets;
    const slidesPerSheetValue = value && value[this.SLIDES_PER_SHEET] ? value[this.SLIDES_PER_SHEET] : '1';
    let quantityVeenersFileConfig = Math.ceil(quantityPagesFile / slidesPerSheetValue);
    return this.formBuilder.group({
      [this.COLOUR]: [value && value[this.COLOUR] ? value[this.COLOUR] : false],
      [this.DOUBLE_SIDED]: [value && value[this.DOUBLE_SIDED] ? value[this.DOUBLE_SIDED] : ''],
      [this.RANGE]: [value && value[this.RANGE] ? value[this.RANGE] : this.orderService.splitRange("1-" + quantityVeenersFileConfig), [CustomValidators.required('Campo requerido')]],
      [this.OPTIONS_RANGE]: [value && value[this.OPTIONS_RANGE] ? value[this.OPTIONS_RANGE] : OPTIONS_RANGE_ENUM.ALL, [CustomValidators.required('Campo requerido')]],
      [this.SLIDES_PER_SHEET]: [value && value[this.SLIDES_PER_SHEET] ? value[this.SLIDES_PER_SHEET] : '1'],
    },
      { validators: [this.maxRange(file.number_of_sheets, "Max superado")] }
    )
  }

  onChangeSlidesPerSheet(element: { id: string, value: string }, form, file) {
    const optionsRange = form.get(this.OPTIONS_RANGE).value
    if (optionsRange == OPTIONS_RANGE_ENUM.ALL) {
      this.setAllPagesToRange(form, file);
    }
  }

  onChangeOptionsRange(element: { id: string, name: string }, form, file) {
    if (element.id == OPTIONS_RANGE_ENUM.ALL) {
      this.setAllPagesToRange(form, file);
    } else if (element.id == OPTIONS_RANGE_ENUM.CUSTOM) {
      form.get(this.RANGE).reset();
    }
  }

  setAllPagesToRange(formConfig, file) {
    const quantityPagesFile = file.number_of_sheets;
    const slidesPerSheetValue = formConfig.get(this.SLIDES_PER_SHEET).value;
    let quantityVeenersFileConfig = Math.ceil(quantityPagesFile / slidesPerSheetValue);
    formConfig.get(this.RANGE).setValue(
      this.orderService.splitRange("1-" + quantityVeenersFileConfig)
    );
  }

  /**
   * Used to add/remove configurations items on file form according to sameConfig and copie values
   */
  setConfigItemsArray(fileItemIndex) {
    const fileFormGroup: AbstractControl = this.filesItemFormArray['controls'][fileItemIndex];
    const copies = fileFormGroup.get(this.COPIES).value;
    const isSameConfig = fileFormGroup.get(this.IS_SAME_CONFIG).value;
    let configurationsFormArray: FormArray = fileFormGroup.get(this.CONFIGURATIONS) as FormArray; // Form array
    const firstConfigValue = configurationsFormArray.controls[0].value;
    configurationsFormArray.clear();
    if (isSameConfig) {
      configurationsFormArray.push(this.createConfigItemForm(fileFormGroup.value.file, firstConfigValue));
    } else {
      for (let i = 0; i < copies; i++) {
        configurationsFormArray.push(this.createConfigItemForm(fileFormGroup.value.file, firstConfigValue));
      }
    }
  }

  showForm() {
    console.log(this.configForm);
  }

  maxRange(quantityPagesFile: number, message: string): ValidatorFn {
    return (control: FormGroup): { [key: string]: any } | null => {
      const slidesPerSheetValue = control.get(this.SLIDES_PER_SHEET).value;
      const rangeValue = control.get(this.RANGE).value;
      let quantityVeenersFileConfig = Math.ceil(quantityPagesFile / slidesPerSheetValue);
      let ret = null;
      if (!!rangeValue) {
        let arr: Array<number> = this.orderService.splitRange(rangeValue);
        console.log('Carillas:', quantityVeenersFileConfig);
        console.log('Carillas:', arr);

        ret = arr[arr.length - 1] <= quantityVeenersFileConfig ? null : { length: message };
      }
      return ret;
    };
  }

  calculateIdSlidesPerSheet = (element) => element.value
  calculateNameSlidesPerSheet = (element) => element.value
  calculatePagesFile = (totalPages, slidesPerSheet) => Math.ceil(totalPages / slidesPerSheet);

}
