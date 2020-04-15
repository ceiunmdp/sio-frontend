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

@Injectable({
    providedIn: 'root'
})
export class AuthGuardUnlogged implements CanActivate, CanActivateChild, CanLoad {
    constructor(private authService: AuthenticationService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const url: string = state.url;
        return this.checkUnlogged(url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

    canLoad(route: Route): boolean {
        const url = `/${route.path}`;

        return this.checkUnlogged(url);
    }

    checkUnlogged(url: string): boolean {
      //   console.log('revisando para el usuario:', this.authService.currentUserValue);
      //   console.log('Autenticado:', this.authService.isAuthenticated());
        if (!this.authService.isAuthenticated()) {
            // console.log('entrooo');
            return true;
        }
        this.router.navigate(['/cei/home']);
        return false;
    }


}