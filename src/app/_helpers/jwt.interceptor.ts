import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
   constructor(private authService: AuthenticationService) {}

   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // Add authorization header with jwt token if available
      const currentUser = this.authService.currentUserValue;
      if (currentUser && currentUser.token) {
         request = request.clone({
            setHeaders: {
               Authorization: `Bearer ${currentUser.token}`
            }
         });
      } else {
         // console.log('No entró en el interceptor');
      }
      return next.handle(request);
   }
}
