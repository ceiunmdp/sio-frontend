import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/_services/admin.service';
import { Career } from 'src/app/_models/orders/career';
import { OrdersService } from '../../orders/orders.service';
import { Year } from 'src/app/_models/orders/year';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { CustomValidators } from 'src/app/_validators/custom-validators';
import { Sort } from 'src/app/_models/sort';

@Component({
  selector: 'cei-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {

  careers: Career[]; isLoadingGetCareers = false;
  years: Year[]; isLoadingGetYears = false;
  isLoadingPostCourse = false;
  _years: Subscription; _careers: Subscription;

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

  constructor(private adminService: AdminService, private orderService: OrdersService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.getCareers();
    this.getYears();
    this.getCourses();
    this.courseForm = this.createCourseForm();
    this.relationsFormArray.valueChanges.subscribe(a => console.log(a));

  }

  ngOnDestroy(): void {
    this._careers.unsubscribe();
    this._years.unsubscribe();
  }

  createCourseForm(): FormGroup {
    const names = this.NAMES_FORM_POST_COURSE;
    return this.formBuilder.group({
      [names.COURSE_NAME]: ['', [CustomValidators.required("Nombre de materia requerido")]],
      [names.RELATIONS]: this.formBuilder.array([
        this.createRelation()
      ])
    });
  }

  createRelation(): FormGroup {
    const names = this.NAMES_FORM_POST_COURSE.relations;
    return this.formBuilder.group({
      [names.RELATION_ID]: ['', [CustomValidators.required("Año requerido")]],
      [names.CAREERS_IDS]: ['', [CustomValidators.required("Carrera/s requerida/s")]],
    })
  }

  addRelation(): void {
    this.relationsFormArray.push(this.createRelation());
  }

  removeRelation(index: number): void {
    this.relationsFormArray.removeAt(index);
  }

  onSubmitCourseForm() {
    this.postCourse();
  }

  getYearsElements(relationFormIndex: number) {
    // Este array contiene todos los años ya seleccionados pero por otros inputs
    const yearsAlreadySelected: string[] = this.relationsFormArray.value.filter((_, index) => index != relationFormIndex).map(relationControl => relationControl.id);
    return !!this.years ? this.years.filter(year => !yearsAlreadySelected.includes(year.id)) : this.years
  }

  // Services

  getCareers() {
    this.isLoadingGetCareers = true;
    const sort: Sort[] = [{ field: 'career.name', sort: 'ASC' }]
    this.orderService.getCareers(null, sort).subscribe(response => {
      this.careers = response.data.items; console.log(this.careers);
    }, e => console.log(e), () => this.isLoadingGetCareers = false);
  }

  getYears() {
    this.isLoadingGetYears = true;
    const sort: Sort[] = [{ field: 'relation.name', sort: 'ASC' }]
    this.orderService.getYears(null, sort).subscribe(response => {
      this.years = response.data.items; console.log(this.years);
    }, e => console.log(e), () => this.isLoadingGetYears = false);
  }

  getCourses() {
    this.orderService.getCourses().subscribe(response => {
      console.log(response.data.items);
    }, e => console.log(e), () => this.isLoadingGetYears = false);
  }

  postCourse() {
    this.isLoadingPostCourse = true;
    this.adminService.postCourse(this.courseForm.value).subscribe(response => {
      console.log(response);
    }, e => console.log(e), () => this.isLoadingPostCourse = false);
  }

}
