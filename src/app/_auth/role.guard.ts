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
import * as jwt_decode from 'jwt-decode';
import { Payload } from '../_models/payload';
import { Routes } from '../_routes/routes';
import { AuthenticationService } from '../_services/authentication.service';

@Injectable({
   providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild, CanLoad {
   constructor(public authService: AuthenticationService, public router: Router) { }

   canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      // This will be passed from the route config on the data property
      const expectedRoles: string[] = route.data.expectedRoles;

      return this.checkRole(expectedRoles, state.url);
   }

   canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      return this.canActivate(route, state);
   }

   canLoad(route: Route): boolean {
      // This will be passed from the route config on the data property
      const expectedRoles: string[] = route.data.expectedRoles;

      // Save the url the user was trying to access
      const url = `/${route.path}`;

      return this.checkRole(expectedRoles, url);
   }

   checkRole(expectedRoles: string[], url: string): boolean {
      // Get the user to find its token and decode it
      const role = this.authService.currentUserValue.type;
      console.log(role, expectedRoles);

      // Here we don't need to verify if the user is authenticated
      // It's not part of the responsibility of this guard
      if (expectedRoles.includes(role)) {
         return true;
      } else {
         // If the user's role is not allowed on this route, redirect to HOME
         this.router.navigate([Routes.HOME]);
         return false;
      }
   }
}
