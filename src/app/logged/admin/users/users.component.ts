import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MatTableDataSource, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { from, Observable, Subscription } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { ChangePasswordDialogComponent } from 'src/app/shared/change-password-dialog/change-password-dialog.component';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI, ResponseAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { User } from 'src/app/_models/users/user';
import { AdminService } from 'src/app/_services/admin.service';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { GeneralService } from 'src/app/_services/general.service';
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
    'name',
    'email',
    'role',
    'verified',
    'disabled',
    'password',
    'delete'
  ];
  displayedStudentsColumns: string[] = [
    'selection',
    'name',
    'email',
    'dni',
    'verified',
    'disabled',
    'scholarship',
    'actions',
    'password'
  ];
  displayedScholarshipsColumns: string[] = [
    'selection',
    'name',
    'email',
    'dni',
    'copies',
    'verified',
    'disabled',
    'scholarship',
    'actions',
    'password'
  ];
  displayedAdminColumns: string[] = [
    'name',
    'email',
    'verified',
    'disabled',
    'actions',
    'password',
    'delete'
  ];
  displayedCampusColumns: string[] = [
    'name',
    'email',
    'verified',
    'disabled',
    'actions',
    'password',
    'delete'
  ];
  displayedProfessorshipsColumns: string[] = [
    'name',
    'email',
    'verified',
    'disabled',
    'actions',
    'password',
    'delete'
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
  changePasswordDialog: MatDialogRef<ChangePasswordDialogComponent>;
  USER_TYPES = USER_TYPES;

  constructor(public generalService: GeneralService, public router: Router, private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private dialogRef: MatDialog, private authService: AuthenticationService, private adminService: AdminService) { }

  ngOnInit() {
    this.generalService.sendMessage({ title: 'Usuarios' })
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

  getSearchFilterByRol(typeUserFilter: typeUserFilter, st: string) {
    let filter;
    const fullNameFilter = this.fb.where('full_name', OPERATORS.CONTAINS, st.trim());
    const emailFilter = this.fb.where('email', OPERATORS.CONTAINS, st.trim());
    const dniFilter = this.fb.where('dni', OPERATORS.CONTAINS, st.trim());
    switch (typeUserFilter) {
      case this.typeUserFilter.ALL:
      case this.typeUserFilter.ADMIN:
      case this.typeUserFilter.CAMPUS_USER:
      case this.typeUserFilter.PROFESSOR_SHIP:
        filter = this.fb.or(fullNameFilter, emailFilter);
        break;
      case this.typeUserFilter.STUDENT:
      case this.typeUserFilter.SCHOLARSHIP:
        filter = this.fb.or(fullNameFilter, emailFilter, dniFilter);
        break;
      default:
        break;
    }
    return filter;
  }

  onGetUser() {
    const searchFilter = !!this.inputFilterValue ? this.getSearchFilterByRol(this.typeUserFilterSelected, this.inputFilterValue) : null;

    if (this.allUsersCheckbox) {
      this.filter = searchFilter ? this.fb.and(searchFilter) : null;
    } else {
      this.filter = searchFilter ? this.fb.and(searchFilter, this.fb.where('disabled', OPERATORS.IS, 'false')) : this.fb.and(this.fb.where('disabled', OPERATORS.IS, 'false'));
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

  changePassword(user) {
    this.dialogRef.open(ChangePasswordDialogComponent, {
      data: {
        userId: user.id, userName: user.display_name, self: true
      },
      minWidth: '40vw'
    });
  }

  deleteUser (user) {
    Swal.fire({
      title: `Atención`,
      text: `¿Seguro desea eliminar del sistema al usuario ${user.display_name}?`,
      icon: 'warning',
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: () => {
        return this.authService.deleteUser(user.id, user.type).toPromise().then(() => {
          Swal.fire({
            title: `Usuario eliminado correctamente`,
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
        return this.adminService.patchStudentsOrScholarships(this.promoteOrDegrade.map(user => { return {id: user.id, type: (type == typeUserFilter.STUDENT) ? USER_TYPES.BECADO : USER_TYPES.ESTUDIANTE} }), type).toPromise().then(newUser => {
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
