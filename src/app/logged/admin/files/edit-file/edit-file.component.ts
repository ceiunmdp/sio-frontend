import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { File } from 'src/app/_models/orders/file';
import { AdminService } from 'src/app/_services/admin.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-edit-file',
  templateUrl: './edit-file.component.html',
  styleUrls: ['./edit-file.component.scss']
})
export class EditFileComponent implements OnInit {

  @Input() file!: File;
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  isLoadingPatchFile = false;

  fileForm: FormGroup;
  public readonly NAMES_FORM_PATCH_FILE = {
    FILE_NAME: 'name',
  };

  constructor(private adminService: AdminService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.fileForm = this.createFileForm(this.file);
  }

  createFileForm(file?: File): FormGroup {
    const names = this.NAMES_FORM_PATCH_FILE;

    return this.formBuilder.group({
      [names.FILE_NAME]: [!!file && !!file.name ? file.name : '', [CustomValidators.required("Nombre de archivo requerido")]]
    });
  }

  onSubmitFileForm() {
    this.patchFile(this.file.id);
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  // Services

  patchFile(fileId: string) {
    this.isLoadingPatchFile = true;
    this.adminService.patchFile(this.fileForm.value, fileId).subscribe(response => {
    }, e => console.log(e), () => { this.isLoadingPatchFile = false; this.onCreated.emit() });
  }

}
