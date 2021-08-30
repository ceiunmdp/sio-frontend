import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { from, Observable, Subscription } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI, ResponseAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { User } from 'src/app/_models/users/user';
import { AdminService } from 'src/app/_services/admin.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { USER_TYPES } from 'src/app/_users/types';
import Swal from 'sweetalert2';
import { API } from './../../../_api/api';

export enum typeUserFilter {
  ALL = 'Todos los usuarios',
  ADMIN = 'Administradores',
  STUDENT = 'Estudiantes',
  SCHOLARSHIP = 'Becados',
  CAMPUS_USER = 'Sedes',
  PROFESSOR_SHIP = 'Cátedras'
}

enum STEPS {
  LIST,
  CREATE_OR_EDIT
}

@Component({
  selector: 'cei-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  public STEPS = STEPS;
  step: STEPS;

  typeUserFilter = typeUserFilter;
  inputFilterValue = ''
  users: User[]; isLoadingGetUsers = false; _users: Subscription;
  selectedUser;
  dataSourceUsers: MatTableDataSource<User>;
  displayedColumns: string[];
  promoteOrDegrade: any[] = [];
  displayedUsersColumns: string[] = [
    'id',
    'name',
    'email',
    'role',
    'verified',
    'disabled',
  ];
  displayedStudentsColumns: string[] = [
    'selection',
    'id',
    'name',
    'email',
    'dni',
    'verified',
    'disabled',
    'scholarship'
  ];
  displayedScholarshipsColumns: string[] = [
    'selection',
    'id',
    'name',
    'email',
    'dni',
    'verified',
    'disabled',
    'scholarship',
    'actions'
  ];
  displayedAdminColumns: string[] = [
    'id',
    'name',
    'email',
    'verified',
    'disabled',
    'actions'
  ];
  displayedCampusColumns: string[] = [
    'id',
    'name',
    'email',
    'verified',
    'disabled',
    'actions'
  ];
  displayedProfessorshipsColumns: string[] = [
    'id',
    'name',
    'email',
    'verified',
    'disabled',
    'actions'
  ];

  typeUserFilterSelected: typeUserFilter;
  typeUserFilterSelectedPost: typeUserFilter; //Only for child component
  // metadata from api
  metaDataUsers: MetadataAPI;
  linksUsers: LinksAPI;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];
  fb: FilterBuilder;
  allUsersCheckbox;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;

  constructor(public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private authService: AuthenticationService, private adminService: AdminService) { }

  ngOnInit() {
    this.step = STEPS.LIST;
    this.fb = new FilterBuilder();
    this.typeUserFilterSelected = typeUserFilter.ALL;
    this.dataSourceUsers = new MatTableDataSource();
    this.displayedColumns = this.displayedUsersColumns;
    this.filter = this.fb.and(this.fb.where('disabled', OPERATORS.IS, 'false'));
    this.allUsersCheckbox = false;
    this.getUsers(this.typeUserFilterSelected, this.filter, this.sort, this.pagination);
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getUsers(this.typeUserFilterSelected, this.filter, this.sort, this.pagination);
  }

  onRefresh(): Promise<User[]> {
    return this.getUsers(this.typeUserFilterSelected, this.filter, this.sort, this.pagination).toPromise();
  }

  onSearch(st: string) {
    const filterqp = this.typeUserFilterSelected == typeUserFilter.ALL ? 'full_name' : 'full_name';
    // TODO: no anda el filtro por email.
    this.filter = this.fb.and(this.fb.where(filterqp, OPERATORS.CONTAINS, st));
    this.getUsers(this.typeUserFilterSelected, this.filter)
  }

  onChangeAllUsersCheckbox(allUsers: boolean) {
    this.inputFilterValue = '';
    if (!allUsers) {
      this.filter = this.fb.and(this.fb.where('disabled', OPERATORS.IS, 'false'));
    }

    this.getUsers(this.typeUserFilterSelected, this.filter)
  }

  onTypeUserFilter(typeUserFilter: typeUserFilter) {
    this.promoteOrDegrade = [];
    this.inputFilterValue = '';
    this.filter = null;
    this.getUsers(typeUserFilter, this.filter, this.sort, this.pagination)
    switch (typeUserFilter) {
      case this.typeUserFilter.ALL:
        this.displayedColumns = this.displayedUsersColumns;
        break;
      case this.typeUserFilter.STUDENT:
        this.displayedColumns = this.displayedStudentsColumns;
        break;
      case this.typeUserFilter.ADMIN:
        this.displayedColumns = this.displayedAdminColumns;
        break;
      case this.typeUserFilter.CAMPUS_USER:
        this.displayedColumns = this.displayedCampusColumns;
        break;
      case this.typeUserFilter.PROFESSOR_SHIP:
        this.displayedColumns = this.displayedProfessorshipsColumns;
        break;
      case this.typeUserFilter.SCHOLARSHIP:
        this.displayedColumns = this.displayedScholarshipsColumns;
        break;
      default:
        break;
    }
  }

  onEditUser(user) {
    console.log(user)
    this.selectedUser = user;
    if (this.typeUserFilterSelected == typeUserFilter.ALL) {
      this.typeUserFilterSelectedPost = user.type;
    } else {
      console.log(this.typeUserFilterSelected)
      this.typeUserFilterSelectedPost = this.typeUserFilterSelected;
    }
    this.step = STEPS.CREATE_OR_EDIT;
  }

  onChangeEnabledUser(user) {
    Swal.fire({
      title: `Atención`,
      text: `¿Seguro desea ${!user.disabled ? 'deshabilitar' : 'habilitar'} el usuario ${user.display_name}?`,
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: () => {
        return this.authService.patchUser({ disabled: !user.disabled }, user.id).toPromise().then(newUser => {
          console.log(newUser);
          Swal.fire({
            title: `Usuario ${!user.disabled ? 'deshabilitado' : 'habilitado'} correctamente`,
            icon: 'success'
          })
          this.onRefresh();
        }).catch(err => this.handleErrors(err))
      }
    })
  }

  onChangeScholarshipUser(user) {
    Swal.fire({
      title: `Atención`,
      text: `¿Seguro desea ${user.type === USER_TYPES.BECADO ? 'deshabilitar' : 'habilitar'} la beca del usuario ${user.display_name}?`,
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: () => {
        return this.authService.patchUserStudentScholarship(user.type === USER_TYPES.BECADO ? API.USERS_SCHOLARSHIPS : API.USERS_STUDENTS,{ type: user.type === USER_TYPES.ESTUDIANTE ? USER_TYPES.BECADO : USER_TYPES.ESTUDIANTE }, user.id).toPromise().then(newUser => {
          Swal.fire({
            title: `Usuario ${newUser.data.type === USER_TYPES.ESTUDIANTE ? 'desasignado de' : 'asignado a'} la beca correctamente`,
            icon: 'success'
          })
          this.onRefresh();
        }).catch(err => this.handleErrors(err))
      }
    })
  }

  onReloadCopies() {
    Swal.fire({
      title: `Atención`,
      text: `¿Seguro desea restaurar las copias de TODOS los becados?`,
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: () => {
        return this.adminService.copiesReloader().toPromise().then(newUser => {
          console.log(newUser);
          Swal.fire({
            title: `Copias restauradas exitosamente`,
            icon: 'success'
          }).catch(err => this.handleErrors(err))
          this.onRefresh();
        })
      }
    })
  }

  fromCreateOrEditToList(refresh = false) {
    this.step = STEPS.LIST;
    this.selectedUser = null; // Reset selectedCourse
    if (refresh) this.onRefresh();
  }

  // Services

  getUsers(typeUser: typeUserFilter = typeUserFilter.ALL, filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<User[]> {
    this.typeUserFilterSelected = typeUser;
    this.isLoadingGetUsers = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      let resourceUrl: Observable<ResponseAPI<any>>;
      switch (typeUser) {
        case typeUserFilter.ALL:
          resourceUrl = this.authService.getUsers(filter, sort, pagination).pipe(
            map((responseApi: ResponseAPI<User[]>) => {
              const newItems = responseApi.data.items.map((user: User) => {
                const newUser = { ...user };
                switch (user.type) {
                  case USER_TYPES.ADMIN:
                    newUser['typeText'] = 'Administrador';
                    break;
                  case USER_TYPES.BECADO:
                    newUser['typeText'] = 'Becado';
                    break;
                  case USER_TYPES.CATEDRA:
                    newUser['typeText'] = 'Cátedra';
                    break;
                  case USER_TYPES.ESTUDIANTE:
                    newUser['typeText'] = 'Estudiante';
                    break;
                  case USER_TYPES.SEDE:
                    newUser['typeText'] = 'Sede';
                    break;
                  default:
                    break;
                }
                return newUser;
              })
              responseApi.data.items = newItems;
              return responseApi;
            })
          );
          break;
        case typeUserFilter.STUDENT:
          resourceUrl = this.authService.getStudents(filter, sort, pagination);
          break;
        case typeUserFilter.ADMIN:
          resourceUrl = this.authService.getAdmins(filter, sort, pagination);
          break;
        case typeUserFilter.CAMPUS_USER:
          resourceUrl = this.authService.getCampuses(filter, sort, pagination);
          break;
        case typeUserFilter.PROFESSOR_SHIP:
          resourceUrl = this.authService.getProfessorships(filter, sort, pagination);
          break;
        case typeUserFilter.SCHOLARSHIP:
          resourceUrl = this.authService.getScholarships(filter, sort, pagination);
          break;
        default:
          break;
      }
      resourceUrl.pipe(
        finalize(() => {
          this.isLoadingGetUsers = false;
        })
      ).subscribe(
        (data) => { this.metaDataUsers = { ...data.data.meta }; this.linksUsers = data.data.links; this.dataSourceUsers.data = data.data.items; res(data.data.items) },
        (e) => { this.handleErrors(e); rej(e) },
      )
    })
    return from(promise);
  }

  onCheckbox(checked, user) {
    checked ? this.promoteOrDegrade.push({id: user.id, name: user.display_name}) : this.promoteOrDegrade = this.promoteOrDegrade.filter(userx => userx.id != user.id);
    console.table(this.promoteOrDegrade)
  }

  degradeOrPromote(type) {
    let names = this.promoteOrDegrade.map(user => user.name + '\n')
    Swal.fire({
      title: `Atención`,
      text: `¿Seguro desea ${type === typeUserFilter.STUDENT ? 'promover a becados los siguientes estudiantes:\n' : 'degradar a estudiantes a los siguientes becados:\n'}${names}?`,
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: () => {
        return this.adminService.patchStudentsOrSholarships(this.promoteOrDegrade.map(user => { return {id: user.id, type: (type == typeUserFilter.STUDENT) ? USER_TYPES.BECADO : USER_TYPES.ESTUDIANTE} }), type).toPromise().then(newUser => {
          Swal.fire({
            title: `Usuarios ${type === typeUserFilter.STUDENT ? 'promovidos' : 'degradados'} correctamente`,
            icon: 'success'
          })
          this.onRefresh();
        }).catch(err => this.handleErrors(err))
      }
    })
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
