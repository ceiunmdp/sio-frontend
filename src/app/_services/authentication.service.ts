import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { map, mergeMap, tap, switchMap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { API, API as APIS } from '../_api/api';
import { AND, OR } from '../_helpers/filterBuilder';
import { Pagination } from '../_models/pagination';
import { ResponseAPI } from '../_models/response-api';
import { Sort } from '../_models/sort';
import { Student, User } from '../_models/users/user';
import { Routes } from '../_routes/routes';
import { USER_TYPES } from '../_users/types';
import { GeneralService } from './general.service';
import { RestUtilitiesService } from './rest-utilities.service';
import * as jwt_decode from 'jwt-decode';

export interface AdminPost {
    display_name: string,
    email: string,
    password: string
}
export interface CampusUserPost {
    display_name: string,
    email: string,
    password: string,
    campus_id: string
}
export interface ProfessorShipPost {
    display_name: string,
    email: string,
    password: string,
    course_id: string,
    available_storage: number
}

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    currentUser$: Observable<User>;
    // tslint:disable-next-line: variable-name
    private _redirectUrl: string;

    private _isSetFB: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public readonly isSetFB$: Observable<boolean> = this._isSetFB.asObservable();

    constructor(private http: HttpClient, private restService: RestUtilitiesService, private router: Router, private afAuth: AngularFireAuth, private generalService: GeneralService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser$ = this.currentUserSubject.asObservable();
        this._isSetFB.next(false);
        this.afAuth.authState.subscribe(user => {
          console.log('Se finalizó de setear FB', user);
          this._isSetFB.next(true);
        });
    }

    getUsers(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<User[]>> {
        const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination })
        return this.http.get(environment.apiUrl + API.USERS,
            {
                headers: queryHeaders,
                observe: "response",
                params
            }).pipe(
                map<HttpResponse<ResponseAPI<User[]>>, ResponseAPI<User[]>>(result => {
                    return result.body;
                })
            );
    }

    getStudents(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Student[]>> {
        const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination })
        return this.http.get(environment.apiUrl + API.USERS_STUDENTS,
            {
                headers: queryHeaders,
                observe: "response",
                params
            }).pipe(
                map<HttpResponse<ResponseAPI<Student[]>>, ResponseAPI<Student[]>>(result => {
                    return result.body;
                })
            );
    }

    getAdmins(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Student[]>> {
        const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination })
        return this.http.get(environment.apiUrl + API.USERS_ADMINS,
            {
                headers: queryHeaders,
                observe: "response",
                params
            }).pipe(
                map<HttpResponse<ResponseAPI<Student[]>>, ResponseAPI<Student[]>>(result => {
                    return result.body;
                })
            );
    }

    getScholarships(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Student[]>> {
        const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination })
        return this.http.get(environment.apiUrl + API.USERS_SCHOLARSHIPS,
            {
                headers: queryHeaders,
                observe: "response",
                params
            }).pipe(
                map<HttpResponse<ResponseAPI<Student[]>>, ResponseAPI<Student[]>>(result => {
                    return result.body;
                })
            );
    }

    getCampuses(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Student[]>> {
        const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination })
        return this.http.get(environment.apiUrl + API.USERS_CAMPUS,
            {
                headers: queryHeaders,
                observe: "response",
                params
            }).pipe(
                map<HttpResponse<ResponseAPI<Student[]>>, ResponseAPI<Student[]>>(result => {
                    return result.body;
                })
            );
    }

    getProfessorships(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Student[]>> {
        const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
        const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination })
        return this.http.get(environment.apiUrl + API.USERS_PROFESSORSHIPS,
            {
                headers: queryHeaders,
                observe: "response",
                params
            }).pipe(
                map<HttpResponse<ResponseAPI<Student[]>>, ResponseAPI<Student[]>>(result => {
                    return result.body;
                })
            );
    }

    postCampusUser(body: CampusUserPost): Observable<any> {
        const queryHeaders = new HttpHeaders().append(
            "Content-Type",
            "application/json"
        );
        return this.http
            .post<any>(`${environment.apiUrl}${API.USERS_CAMPUS}`, body, {
                headers: queryHeaders,
                observe: "response"
            })
            .pipe<any>(
                map<HttpResponse<any>, any>(response => {
                    return response.body;
                })
            );
    }
    postProfessorShip(body: ProfessorShipPost): Observable<any> {
        const queryHeaders = new HttpHeaders().append(
            "Content-Type",
            "application/json"
        );
        return this.http
            .post<any>(`${environment.apiUrl}${API.USERS_PROFESSORSHIPS}`, body, {
                headers: queryHeaders,
                observe: "response"
            })
            .pipe<any>(
                map<HttpResponse<any>, any>(response => {
                    return response.body;
                })
            );
    }
    postAdmin(body: AdminPost): Observable<any> {
        const queryHeaders = new HttpHeaders().append(
            "Content-Type",
            "application/json"
        );
        return this.http
            .post<any>(`${environment.apiUrl}${API.USERS_ADMINS}`, body, {
                headers: queryHeaders,
                observe: "response"
            })
            .pipe<any>(
                map<HttpResponse<any>, any>(response => {
                    return response.body;
                })
            );
    }

    patchUser(body, userId: string): Observable<any> {
        const queryHeaders = new HttpHeaders().append(
            "Content-Type",
            "application/json"
        );
        return this.http
            .patch<any>(`${environment.apiUrl}${API.USERS}/${userId}`, body, {
                headers: queryHeaders,
                observe: "response"
            })
            .pipe<any>(
                map<HttpResponse<any>, any>(response => {
                    return response.body;
                })
            );
    }

    patchUserStudentScholarship(apiRoute, body, userId: string): Observable<any> {
        const queryHeaders = new HttpHeaders().append(
            "Content-Type",
            "application/json"
        );
        return this.http
            .patch<any>(`${environment.apiUrl}${apiRoute}/${userId}`, body, {
                headers: queryHeaders,
                observe: "response"
            })
            .pipe<any>(
                map<HttpResponse<any>, any>(response => {
                    return response.body;
                })
            );
    }

    patchAdmin(body: Partial<AdminPost>, adminId: string): Observable<any> {
        const queryHeaders = new HttpHeaders().append(
            "Content-Type",
            "application/json"
        );
        return this.http
            .patch<any>(`${environment.apiUrl}${API.USERS_ADMINS}/${adminId}`, body, {
                headers: queryHeaders,
                observe: "response"
            })
            .pipe<any>(
                map<HttpResponse<any>, any>(response => {
                    return response.body;
                })
            );
    }

    patchCampusUser(body: Partial<CampusUserPost>, campusId: string): Observable<any> {
        const queryHeaders = new HttpHeaders().append(
            "Content-Type",
            "application/json"
        );
        return this.http
            .patch<any>(`${environment.apiUrl}${API.USERS_CAMPUS}/${campusId}`, body, {
                headers: queryHeaders,
                observe: "response"
            })
            .pipe<any>(
                map<HttpResponse<any>, any>(response => {
                    return response.body;
                })
            );
    }

    patchProfessorShip(body: Partial<ProfessorShipPost>, professorShipId: string): Observable<any> {
        const queryHeaders = new HttpHeaders().append(
            "Content-Type",
            "application/json"
        );
        return this.http
            .patch<any>(`${environment.apiUrl}${API.USERS_PROFESSORSHIPS}/${professorShipId}`, body, {
                headers: queryHeaders,
                observe: "response"
            })
            .pipe<any>(
                map<HttpResponse<any>, any>(response => {
                    return response.body;
                })
            );
    }

    setDarkTheme(isDarkTheme: boolean): Observable<any> {
      this.updateCurrentUser({dark_theme: isDarkTheme});
      const queryHeaders = new HttpHeaders().append(
          "Content-Type",
          "application/json"
      );
      return this.http
          .patch<any>(`${environment.apiUrl}${API.USER}`, {darkTheme: isDarkTheme}, {
              headers: queryHeaders,
              observe: "response"
          })
          .pipe<any>(
              map<HttpResponse<any>, any>(response => {
                  return response.body;
              })
          );
    }

    get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    get redirectUrl(): string {
        return this._redirectUrl;
    }

    set redirectUrl(url: string) {
        this._redirectUrl = url;
    }

    getAndUpdateUserData(): Observable<User> {
        const token = this.currentUserValue.token;
        const decodedToken = jwt_decode(token);
        return this.getSpecificUserData(decodedToken.role).pipe(
          tap(user => this.updateCurrentUser(user)),
          catchError((e: any) => {
            if(decodedToken.role === USER_TYPES.BECADO) {
              return this.getSpecificUserData(USER_TYPES.ESTUDIANTE).pipe(
                tap(user => this.updateCurrentUser(user)),
              );
            } else {
              return throwError(e);
            }
          })
        );
    }

    getUserData(): Observable<User> {
        const token = this.currentUserValue.token;
        const decodedToken = jwt_decode(token);
        console.log(decodedToken);
        return this.getSpecificUserData(decodedToken.role);
    }

    // TODO: Validarlo
    private getSpecificUserData(role: string): Observable<User> {
      console.log('entro en SPECIFIC', role);
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        let rootPath;
        var url;
        switch (role) {
            case USER_TYPES.ADMIN:
                rootPath = Routes.ADMIN_ROOT_PATH;
                url = `${APIS.USER_ADMIN}`
                break;
            case USER_TYPES.BECADO:
                rootPath = Routes.STUDENT_ROOT_PATH;
                url = `${APIS.USER_SCHOLARSHIP}`
                break;
            case USER_TYPES.CATEDRA:
                rootPath = Routes.PROFESSORSHIP_ROOT_PATH;
                url = `${APIS.USER_PROFESSORSHIP}`
                break;
            case USER_TYPES.SEDE:
                rootPath = Routes.CAMPUS_ROOT_PATH;
                url = `${APIS.USER_CAMPUS}`
                break;
            default:
                rootPath = Routes.STUDENT_ROOT_PATH;
                url = `${APIS.USER_STUDENT}`
                break;
        }
        if (!role) {
          return this.http
              .get(environment.apiUrl + url, { headers: queryHeaders, observe: 'response' })
              .pipe(
                  map<HttpResponse<any>, any>(response => {
                      response.body.data.rootPath = rootPath;
                      return response.body.data;
                  }),
                  switchMap(data => {
                    console.log('REFRESCANDO TOKEJ')
                    return from(this.refreshToken())
                      .pipe(
                        map(_ => data)
                      )
                  })
              );
        } else {
          return this.http
              .get(environment.apiUrl + url, { headers: queryHeaders, observe: 'response' })
              .pipe(
                  map<HttpResponse<any>, any>(response => {
                      response.body.data.rootPath = rootPath;
                      return response.body.data;
                  })
              );
        }
    }

    updateCurrentUser(user: User) {
        if (!!this.currentUserValue) {
            // CurrenUserValue exists, we must update its value
            const u = Object.assign(this.currentUserValue, user);
            // Save the updated object in local storage
            localStorage.setItem('currentUser', JSON.stringify(u));
            // Update the BehaviourSubject with the new user
            this.currentUserSubject.next(u);
        } else {
            // There's no current user value
            localStorage.setItem('currentUser', JSON.stringify(user));
            // Update the BehaviourSubject with the new user
            this.currentUserSubject.next(user);
        }

        if (this.currentUserValue.dark_theme != null && this.currentUserValue.dark_theme != undefined) {
            this.generalService.setDarkTheme(!!this.currentUserValue.dark_theme);
        }
    }

    removeCurrentUser() {
        // Remove user from local storage to log out
        localStorage.removeItem('currentUser');
        // Set the currentUserSubject to null, indicating that the user is no longer logged in the app
        this.currentUserSubject.next(null);
        this._redirectUrl = null;
    }

    deleteUser(userId, role) {
      const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
      var url;
      switch (role) {
          case USER_TYPES.ADMIN:
              url = `${APIS.USERS_ADMINS}`
              break;
          case USER_TYPES.BECADO:
              url = `${APIS.USERS_SCHOLARSHIPS}`
              break;
          case USER_TYPES.CATEDRA:
              url = `${APIS.USERS_PROFESSORSHIPS}`
              break;
          case USER_TYPES.SEDE:
              url = `${APIS.USERS_CAMPUS}`
              break;
          default:
              url = `${APIS.USERS_STUDENTS}`
              break;
      }
      return this.http
        .delete(environment.apiUrl + url + '/' + userId, { headers: queryHeaders, observe: 'response' })
        .pipe(
          map<HttpResponse<any>, any>(response => {
              return response.body
          })
      );
    }

    logout(): Observable<any> {
      // console.log('USUARIO',this.afAuth.auth.currentUser );
      // console.log('USUARIO COND', !!this.afAuth.auth.currentUser );
      //   if (!!this.afAuth.auth.currentUser) {
      //     console.log('cerrando sesion!!');
          return from(this.afAuth.auth.signOut().then(a => {
              console.log('cerro sesion', a);
          }, err => console.log(err)));
        // } else {
        //   console.log('no cerro sesion');
        //   return of(true);
        // }
    }

    verifyAndUpdateToken() {
      console.log('tratando de refrescar token', this.afAuth.auth.currentUser.displayName);
      return from(this.afAuth.auth.currentUser.getIdToken()
        .then((idToken) => {
            const u: User = {
                token: idToken,
            }
            this.updateCurrentUser(u);
        })
        .catch(e => console.log('ERRRPRPPPPPPOOOOR', e)));
    }

    refreshToken(): Promise<any> {
        console.log('tratando de refrescar token', this.afAuth);
        if (!!this.afAuth.auth && !!this.afAuth.auth.currentUser) {
          console.log('tratando de refrescar token dentro del if', this.afAuth);
            return this.afAuth.auth.currentUser.getIdToken(true)
                .then((idToken) => {
                  console.log(idToken);
                    const u: User = {
                        token: idToken,
                    }
                    this.updateCurrentUser(u);
                })
                .catch(e => console.log('error', e))

        } else {
            return new Promise((res, rej) => rej())
        }
    }

    isAuthenticated() {
        return this.currentUserValue !== null;
    }
}
