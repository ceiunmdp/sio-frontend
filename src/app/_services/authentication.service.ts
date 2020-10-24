import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/users/user';
import { GeneralService } from './general.service';
import { USER_TYPES } from '../_users/types';
import { API as APIS } from '../_api/api';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    currentUser$: Observable<User>;
    // tslint:disable-next-line: variable-name
    private _redirectUrl: string;

    constructor(private http: HttpClient, private router: Router, private afAuth: AngularFireAuth, private generalService: GeneralService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser$ = this.currentUserSubject.asObservable();
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
                mergeMap(basicUser => { console.log(basicUser); return this.getSpecificUserData(basicUser) }),
                map(user => { return { ...basicUser, ...user } }),
                tap(user => console.log('usuario final:', user))
            );
    }

    // TODO: Validarlo
    private getSpecificUserData(basicUser: Partial<User>): Observable<User> {
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');
        const type = basicUser.type;
        var url;
        switch (type) {
            case USER_TYPES.ADMIN:
                url = `${APIS.USERS_ADMINS}/${basicUser.id}`
                break;
            case USER_TYPES.ESTUDIANTE:
                url = `${APIS.USERS_STUDENTS}/${basicUser.id}`
                break;
            case USER_TYPES.BECADO:
                url = `${APIS.USERS_SCHOLARSHIPS}/${basicUser.id}`
                break;
            case USER_TYPES.CATEDRA:
                url = `${APIS.USERS_PROFESSORSHIPS}/${basicUser.id}`
                break;
            case USER_TYPES.SEDE:
                url = `${APIS.USERS_CAMPUS}/${basicUser.id}`
                break;
            default:
                break;
        }
        return this.http
            .get(environment.apiUrl + url, { headers: queryHeaders, observe: 'response' })
            .pipe(
                map<HttpResponse<any>, any>(response => {
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
