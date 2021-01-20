import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomValidators } from 'src/app/_validators/custom-validators';
import { typeUserFilter } from '../users.component';
import { Subscription, Observable } from 'rxjs';
import { OrdersService } from 'src/app/logged/orders/orders.service';
import { FilterBuilder, OPERATORS } from 'src/app/_helpers/filterBuilder';
import { map } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { Course } from 'src/app/_models/orders/course';

@Component({
  selector: 'cei-create-edit-user',
  templateUrl: './create-edit-user.component.html',
  styleUrls: ['./create-edit-user.component.scss']
})
export class CreateEditUserComponent implements OnInit {
  @Input() typeUserSelected: typeUserFilter.CAMPUS_USER | typeUserFilter.PROFESSOR_SHIP | typeUserFilter.ADMIN;
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
    COURSE_SEARCHING: 'course_searching'
  };

  constructor(private formBuilder: FormBuilder, private orderService: OrdersService, private authService: AuthenticationService) {
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
        }, e => console.error(e));

        break;
      case typeUserFilter.PROFESSOR_SHIP:
        if (!!this.user) {
          this.loadingElementsCourses = true;
          this.getCourseById(this.user.course.id).subscribe(
            courses => {
              this.elementsCourses = courses
              this.userForm = this.createForm(this.user)(this.typeUserSelected);
              this.loadingElementsCourses = false;
            },e => this.loadingElementsCourses = false, () => this.loadingElementsCourses = false
          )
        } else {
          this.userForm = this.createForm(this.user)(this.typeUserSelected);
        }
        break;
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
        default:
          break;
      }
    }
  }

  onClickCancel() {
    this.onCancelled.emit();
  }

  onSubmitForm(typeUser: typeUserFilter.ADMIN | typeUserFilter.CAMPUS_USER | typeUserFilter.PROFESSOR_SHIP) {
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
    }
    resourceUrl$.subscribe(res => console.log(res), e => { console.error(e); this.isLoadingPostUser = false; }, () => { this.isLoadingPostUser = false; this.onCreated.emit() });
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


}
