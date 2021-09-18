import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrdersService } from 'src/app/logged/student/orders/orders.service';
import { FilterBuilder, OPERATORS } from 'src/app/_helpers/filterBuilder';
import { Course } from 'src/app/_models/orders/course';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';
import { typeUserFilter } from '../users.component';
import { API } from './../../../../_api/api';

@Component({
  selector: 'cei-create-edit-user',
  templateUrl: './create-edit-user.component.html',
  styleUrls: ['./create-edit-user.component.scss']
})
export class CreateEditUserComponent implements OnInit {
  @Input() typeUserSelected: typeUserFilter.CAMPUS_USER | typeUserFilter.PROFESSOR_SHIP | typeUserFilter.ADMIN | typeUserFilter.SCHOLARSHIP;
  @Input() user;
  @Output('created') onCreated = new EventEmitter();
  @Output('cancelled') onCancelled = new EventEmitter();
  fb: FilterBuilder;
  campuses; _campuses: Subscription;
  typeUsers = typeUserFilter;
  elementsCourses: Course[];
  loadingElementsCourses:boolean = false;
  isLoadingPostUser = false;
  userForm: FormGroup;
  public readonly NAMES_FORM_POST_USER = {
    NAME: 'display_name',
    EMAIL: 'email',
    PASSWORD: 'password',
    CAMPUS: 'campus_id', // For Campus User
    COURSE: 'course_id', // For ProfessorShip
    AVAILABLE_COPIES: 'available_copies', // For ScholarShip
    REMAINING_COPIES: 'remaining_copies', // For ScholarShip
    COURSE_SEARCHING: 'course_searching'
  };
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  constructor(public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private formBuilder: FormBuilder, private orderService: OrdersService, private authService: AuthenticationService) {
    this.fb = new FilterBuilder()
  }

  ngOnInit() {
    // Specific actions according to user type
    switch (this.typeUserSelected) {
      case typeUserFilter.ADMIN:
        this.userForm = this.createForm(this.user)(this.typeUserSelected);
        break;
      case typeUserFilter.CAMPUS_USER:
        this._campuses = this.getCampuses().subscribe(response => {
          this.campuses = response.data.items;
          this.userForm = this.createForm(this.user)(this.typeUserSelected);
        }, e => this.handleErrors(e));
        break;
      case typeUserFilter.PROFESSOR_SHIP:
        if (!!this.user) {
          this.loadingElementsCourses = true;
          this.getCourseById(this.user.course.id).subscribe(
            courses => {
              this.elementsCourses = courses
              this.userForm = this.createForm(this.user)(this.typeUserSelected);
              this.loadingElementsCourses = false;
            },e => {this.handleErrors(e); this.loadingElementsCourses = false}, () => this.loadingElementsCourses = false
          )
        } else {
          this.userForm = this.createForm(this.user)(this.typeUserSelected);
        }
        break;
      case typeUserFilter.SCHOLARSHIP:
        this.userForm = this.createForm(this.user)(this.typeUserSelected);
      default:
        break;
    }
  }

  createForm(user?) {
    const genericForm = this.formBuilder.group({
      [this.NAMES_FORM_POST_USER.NAME]: [{ value: !!user && !!user.display_name ? user.display_name : '', disabled: false }, [CustomValidators.required("Nombre de usuario requerido")]],
      [this.NAMES_FORM_POST_USER.EMAIL]: [{ value: !!user && !!user.email ? user.email : '', disabled: !!user }, [CustomValidators.required("Email requerido"), CustomValidators.email('Formato de email inválido')]],
      [this.NAMES_FORM_POST_USER.PASSWORD]: [{ value: '', disabled: !!user }, [CustomValidators.required("Contraseña requerida"), CustomValidators.minLength(8, 'Contraseña muy corta')]],
    });
    return (typeUserSelected) => {
      const handleAdmin = () => {
        return genericForm;
      }
      const handleCampusUser = () => {
        const specificForm = this.formBuilder.group({
          ...genericForm.controls,
          [this.NAMES_FORM_POST_USER.CAMPUS]: [!!user && !!user.campus && !!user.campus.id ? user.campus.id : '', [CustomValidators.required("Sede requerida")]],
        })
        return specificForm;
      }
      const handleScholarShip = () => {
        const specificForm = this.formBuilder.group({
          ...genericForm.controls,
          [this.NAMES_FORM_POST_USER.AVAILABLE_COPIES]: [!!user ? user.available_copies: '', [CustomValidators.required("Sede requerida")]],
          [this.NAMES_FORM_POST_USER.REMAINING_COPIES]: [!!user ? user.remaining_copies : '', [CustomValidators.required("Sede requerida")]],
        })
        return specificForm;
      }
      const handleProfessorShip = () => {
        const specificForm = this.formBuilder.group({
          ...genericForm.controls,
          [this.NAMES_FORM_POST_USER.COURSE]: [!!user && !!user.course && !!user.course.id ? user.course.id : '', [CustomValidators.required("Materia requerida")]],
          [this.NAMES_FORM_POST_USER.COURSE_SEARCHING]: [''],
        })
        return specificForm;
      }
      switch (typeUserSelected) {
        case this.typeUsers.ADMIN:
          return handleAdmin();
        case this.typeUsers.CAMPUS_USER:
          return handleCampusUser();
        case this.typeUsers.PROFESSOR_SHIP:
          return handleProfessorShip();
        case this.typeUsers.SCHOLARSHIP:
          return handleScholarShip();
        default:
          break;
      }
    }
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  onSubmitForm(typeUser: typeUserFilter.ADMIN | typeUserFilter.CAMPUS_USER | typeUserFilter.PROFESSOR_SHIP | typeUserFilter.SCHOLARSHIP) {
    this.isLoadingPostUser = true;
    let resourceUrl$: Observable<any>;
    const body = JSON.parse(JSON.stringify(this.userForm.value));
    delete body[this.NAMES_FORM_POST_USER.COURSE_SEARCHING]
    switch (typeUser) {
      case typeUserFilter.ADMIN:
        resourceUrl$ = !this.user ? this.authService.postAdmin(body) : this.authService.patchAdmin(body, this.user.id);
        break;
      case typeUserFilter.CAMPUS_USER:
        resourceUrl$ = this.authService.postCampusUser(body);
        break;
      case typeUserFilter.PROFESSOR_SHIP:
        resourceUrl$ = this.authService.postProfessorShip(body);
        break;
      case typeUserFilter.SCHOLARSHIP:
        resourceUrl$ = this.authService.patchUserStudentScholarship(API.USERS_SCHOLARSHIPS, body, this.user.id);
        break;
    }
    resourceUrl$.subscribe(res => console.log(res), e => { this.handleErrors(e); this.isLoadingPostUser = false; }, () => { this.isLoadingPostUser = false; this.onCreated.emit() });
  }

  // Services

  getCampuses() {
    return this.orderService.getCampuses();
  }

  getCourseById = (id: string) => {
    const filter = this.fb.and(this.fb.where('course.id', OPERATORS.IS, id));
    return this.orderService.getCourses(filter).pipe(map(response => response.data.items))
  }

  getCoursesByNameAndSurname = (value: string) => {
    const filter = this.fb.and(this.fb.where('course.name', OPERATORS.CONTAINS, value));
    return this.orderService.getCourses(filter).pipe(map(response => response.data.items))
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }
}
