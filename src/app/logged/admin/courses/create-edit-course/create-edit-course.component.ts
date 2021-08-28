import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Career } from 'src/app/_models/orders/career';
import { Course } from 'src/app/_models/orders/course';
import { Year } from 'src/app/_models/orders/year';
import { Relation } from 'src/app/_models/relation';
import { AdminService } from 'src/app/_services/admin.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';

@Component({
  selector: 'cei-create-edit-course',
  templateUrl: './create-edit-course.component.html',
  styleUrls: ['./create-edit-course.component.scss']
})
export class CreateEditCourseComponent implements OnInit {
  @Input() careers: Career[];
  @Input() years: Year[];
  @Input() course: Course; // if this input is not null -> edit else -> create
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  isLoadingPostCourse = false;

  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  courseForm: FormGroup;
  public readonly NAMES_FORM_POST_COURSE = {
    COURSE_NAME: 'name',
    RELATIONS: 'relations',
    relations: {
      RELATION_ID: 'id',
      CAREERS_IDS: 'careers_ids'
    }
  };

  get relationsFormArray(): FormArray {
    return this.courseForm.get(this.NAMES_FORM_POST_COURSE.RELATIONS) as FormArray;
  }

  constructor(private adminService: AdminService, private formBuilder: FormBuilder, public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService) { }

  ngOnInit() {
    this.courseForm = this.createCourseForm(this.course);
  }

  createCourseForm(course?: Course): FormGroup {
    const names = this.NAMES_FORM_POST_COURSE;
    var relationsFormGroups;
    if (!!course && !!course.relations && course.relations.length > 0) {
      relationsFormGroups = course.relations.map(relation => this.createRelation(relation));
    }

    return this.formBuilder.group({
      [names.COURSE_NAME]: [!!course && !!course.name ? course.name : '', [CustomValidators.required("Nombre de materia requerido")]],
      [names.RELATIONS]: relationsFormGroups ? this.formBuilder.array(relationsFormGroups) : this.formBuilder.array([
        this.createRelation()
      ])
    });
  }

  createRelation(relation?: Relation): FormGroup {
    const names = this.NAMES_FORM_POST_COURSE.relations;
    return this.formBuilder.group({
      [names.RELATION_ID]: [!!relation && !!relation.name ? relation.id : '', [CustomValidators.required("Año requerido")]],
      [names.CAREERS_IDS]: [!!relation && !!relation.careers ? relation.careers.map(career => career.id) : '', [CustomValidators.required("Carrera/s requerida/s")]],
    })
  }

  addRelation(relation?: Relation): void {
    this.relationsFormArray.push(this.createRelation(relation));
  }

  removeRelation(index: number): void {
    this.relationsFormArray.removeAt(index);
  }

  onSubmitCourseForm() {
    !!this.course ? this.patchCourse(this.course.id) : this.postCourse();
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  getYearsElements(relationFormIndex: number) {
    // Este array contiene todos los años ya seleccionados pero por otros inputs
    const yearsAlreadySelected: string[] = this.relationsFormArray.value.filter((_, index) => index != relationFormIndex).map(relationControl => relationControl.id);
    return !!this.years ? this.years.filter(year => !yearsAlreadySelected.includes(year.id)) : this.years
  }

  // Services

  postCourse() {
    this.isLoadingPostCourse = true;
    this.adminService.postCourse(this.courseForm.value).subscribe(response => {
    }, e => { this.handleErrors(e); this.isLoadingPostCourse = false }, () => { this.isLoadingPostCourse = false; this.onCreated.emit() });
  }

  patchCourse(courseId: string) {
    this.isLoadingPostCourse = true;
    this.adminService.patchCourse(this.courseForm.value, courseId).subscribe(response => {
    }, e => { this.handleErrors(e); this.isLoadingPostCourse = false }, () => { this.isLoadingPostCourse = false; this.onCreated.emit() });
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
