import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
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
    course_id: string
}

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    currentUser$: Observable<User>;
    // tslint:disable-next-line: variable-name
    private _redirectUrl: string;

    constructor(private http: HttpClient, private restService: RestUtilitiesService, private router: Router, private afAuth: AngularFireAuth, private generalService: GeneralService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser$ = this.currentUserSubject.asObservable();
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
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        let basicUser: Partial<User>;
        return this.http
            .get(environment.apiUrl + APIS.USER, { headers: queryHeaders, observe: 'response' })
            .pipe(
                map<HttpResponse<any>, any>(response => {
                    basicUser = { ...response.body.data };
                    return response.body.data;
                }),
                // Acá pedir al usuario particular
                mergeMap(basicUser => { console.log(basicUser); return this.getSpecificUserData(basicUser) }),
                map(user => { return { ...basicUser, ...user } }),
                tap(user => this.updateCurrentUser(user))
            );
    }

    getUserData(): Observable<User> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        let basicUser: Partial<User>;
        return this.http
            .get(environment.apiUrl + APIS.USER, { headers: queryHeaders, observe: 'response' })
            .pipe(
                map<HttpResponse<any>, any>(response => {
                    basicUser = { ...response.body.data };
                    return response.body.data;
                }),
                // Acá pedir al usuario particular
                mergeMap(basicUser => this.getSpecificUserData(basicUser)),
                map(user => { console.log('basico', basicUser);return { ...basicUser, ...user } }),
                tap(user => console.log('usuario final:', user))
            );
    }

    // TODO: Validarlo
    private getSpecificUserData(basicUser: Partial<User>): Observable<User> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const type = basicUser.type;
        let rootPath;
        var url;
        switch (type) {
            case USER_TYPES.ADMIN:
                rootPath = Routes.ADMIN_ROOT_PATH;
                url = `${APIS.USER_ADMIN}`
                break;
            case USER_TYPES.ESTUDIANTE:
                rootPath = Routes.STUDENT_ROOT_PATH;
                url = `${APIS.USER_STUDENT}`
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
                break;
        }
        return this.http
            .get(environment.apiUrl + url, { headers: queryHeaders, observe: 'response' })
            .pipe(
                map<HttpResponse<any>, any>(response => {
                    response.body.data.rootPath = rootPath;
                    return response.body.data;
                })
            );
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

    logout(): Observable<any> {
        return from(this.afAuth.auth.signOut().then(a => {
            console.log('cerro sesion', a);

        }, err => console.log(err)));
    }

    refreshToken(): Promise<any> {
        console.log('tratando de refrescar token', this.afAuth);
        if (!!this.afAuth.auth && !!this.afAuth.auth.currentUser) {
            return this.afAuth.auth.currentUser.getIdToken(true)
                .then((idToken) => {
                    const u: User = {
                        token: idToken,
                    }
                    this.updateCurrentUser(u);
                });

        } else {
            return new Promise((res, rej) => rej())
        }
    }

    isAuthenticated() {
        return this.currentUserValue !== null;
    }
}
