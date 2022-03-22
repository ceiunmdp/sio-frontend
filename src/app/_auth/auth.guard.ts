import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    CanLoad,
    Route,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import { Routes } from '../_routes/routes';
import { AuthenticationService } from '../_services/authentication.service';
import {takeWhile} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
    constructor(private authService: AuthenticationService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        const url: string = state.url;
        return this.authService.isSetFB$.pipe(
          takeWhile(isSet => !isSet),
        ).toPromise().then(() => this.checkLogin(url));
    }


    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return this.canActivate(route, state);
    }

    // canLoad(route: Route): boolean {
    //     const url = `/${route.path}`;

    //     return this.checkLogin(url);
    // }

    canLoad(route: Route): boolean {
        const url: string = route.path;
        return this.checkLogin(url);
    }

    checkLogin(url: string): boolean {
        //   console.log(url);
        if (this.authService.isAuthenticated()) {
            return true;
        }
        // Store the attempted URL for redirecting
        // Once the user is authenticated, the app will redirect him to the redirectUrl
        // this.authService.redirectUrl = url;

        // Navigate to the login page with extras
        this.router.navigate([Routes.LOGIN]);
        return false;
    }
}
