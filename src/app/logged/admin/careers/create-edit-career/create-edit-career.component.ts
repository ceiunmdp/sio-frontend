import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Career } from 'src/app/_models/orders/career';
import { Year } from 'src/app/_models/orders/year';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { AdminService } from 'src/app/_services/admin.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-create-edit-career',
  templateUrl: './create-edit-career.component.html',
  styleUrls: ['./create-edit-career.component.scss']
})
export class CreateEditCareerComponent implements OnInit {
  @Input() careers: Career[];
  @Input() career: Career; // if this input is not null -> edit else -> create
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  isLoadingPostCareer = false;

  careerForm: FormGroup;
  public readonly NAMES_FORM_POST_CAREER = {
    CAREER_NAME: 'name',
  };

  constructor(private adminService: AdminService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.careerForm = this.createCareerForm(this.career);
  }

  createCareerForm(career?: Career): FormGroup {
    const names = this.NAMES_FORM_POST_CAREER;

    return this.formBuilder.group({
      [names.CAREER_NAME]: [!!career && !!career.name ? career.name : '', [CustomValidators.required("Nombre de carrera requerido")]]
    });
  }

  onSubmitCareerForm() {
    !!this.career ? this.patchCareer(this.career.id) : this.postCareer();
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  // Services

  postCareer() {
    this.isLoadingPostCareer = true;
    this.adminService.postCareer(this.careerForm.value).subscribe(response => {
      console.log(response);
    }, e => console.log(e), () => { this.isLoadingPostCareer = false; this.onCreated.emit() });
  }

  patchCareer(careerId: string) {
    this.isLoadingPostCareer = true;
    console.log('career form', this.careerForm.value)
    this.adminService.patchCareer(this.careerForm.value, careerId).subscribe(response => {
      console.log(response);
    }, e => console.log(e), () => { this.isLoadingPostCareer = false; this.onCreated.emit() });
  }

}
