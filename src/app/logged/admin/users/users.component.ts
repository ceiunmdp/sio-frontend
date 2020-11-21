import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, PageEvent } from '@angular/material';
import { from, Observable, Subscription } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AND, FilterBuilder, OR, OPERATORS } from 'src/app/_helpers/filterBuilder';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI, ResponseAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { User } from 'src/app/_models/users/user';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { Roles } from 'src/app/_roles/roles';
import { USER_TYPES } from 'src/app/_users/types';

enum typeUserFilter {
  ALL = 'Todos los usuarios',
  ADMIN = 'Administradores',
  STUDENT = 'Estudiantes',
  SCHOLARSHIP = 'Becados',
  CAMPUS_USER = 'Sedes',
  PROFESSOR_SHIP = 'Cátedras'
}

@Component({
  selector: 'cei-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  typeUserFilter = typeUserFilter;
  inputFilterValue = ''
  users: User[]; isLoadingGetUsers = false; _users: Subscription;
  dataSourceUsers: MatTableDataSource<User>;
  displayedColumns: string[];
  displayedUsersColumns: string[] = [
    'id',
    'name',
    'email',
    'role',
    'verified',
    'disabled',
  ];
  displayedStudentsColumns: string[] = [
    'id',
    'name',
    'email',
    'dni',
    'verified',
    'disabled',
  ];
  displayedScholarshipsColumns: string[] = [
    'id',
    'name',
    'email',
    'dni',
    'verified',
    'disabled',
  ];
  displayedAdminColumns: string[] = [
    'id',
    'name',
    'email',
    'verified',
    'disabled',
  ];
  displayedCampusColumns: string[] = [
    'id',
    'name',
    'email',
    'campus',
    'verified',
    'disabled',
  ];
  displayedProfessorshipsColumns: string[] = [
    'id',
    'name',
    'email',
    'verified',
    'disabled',
  ];

  typeUserFilterSelected: typeUserFilter;
  // metadata from api
  metaDataUsers: MetadataAPI;
  linksUsers: LinksAPI;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];
  fb: FilterBuilder;

  constructor(private authService: AuthenticationService, ) { }

  ngOnInit() {
    this.fb = new FilterBuilder();
    this.typeUserFilterSelected = typeUserFilter.ALL;
    this.dataSourceUsers = new MatTableDataSource();
    this.displayedColumns = this.displayedUsersColumns;
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
    this.filter = this.fb.and(this.fb.where('dni', OPERATORS.CONTAINS, st));
    this.getUsers(this.typeUserFilterSelected, this.filter)
  }

  onTypeUserFilter(typeUserFilter: typeUserFilter) {
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
                    newUser.type = 'Administrador';
                    break;
                  case USER_TYPES.BECADO:
                    newUser.type = 'Becado';
                    break;
                  case USER_TYPES.CATEDRA:
                    newUser.type = 'Cátedra';
                    break;
                  case USER_TYPES.ESTUDIANTE:
                    newUser.type = 'Estudiante';
                    break;
                  case USER_TYPES.SEDE:
                    newUser.type = 'Sede';
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
        (e) => { rej(e) },
      )
    })
    return from(promise);
  }

}
