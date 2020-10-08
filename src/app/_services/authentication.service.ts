import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/users/user';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Routes } from '../_routes/routes';
import { API } from '../_api/api';
import { AngularFireAuth } from '@angular/fire/auth';
import { GeneralService } from './general.service';

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

        return this.http
            .get(environment.apiUrl + '/user', { headers: queryHeaders, observe: 'response' })
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
        return from(this.afAuth.signOut().then(a => {
            console.log('cerro sesion', a);

        }, err => console.log(err)));
        const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');

        // return this.http
        //     .get(`${environment.apiUrl}/${API.LOGOUT}`, { headers: queryHeaders, observe: 'response' })
        //     .pipe(
        //         map<HttpResponse<any>, any>(response => {
        //             this.router.navigate([Routes.LOGIN]);
        //             return response.body.message;
        //         })
        //     );

    }

    isAuthenticated() {
        return this.currentUserValue !== null;
    }
}
