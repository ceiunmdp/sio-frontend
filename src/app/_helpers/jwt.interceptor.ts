import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthenticationService } from '../_services/authentication.service';
import { tap, catchError } from 'rxjs/operators';
import { HttpErrorResponseHandlerService } from '../_services/http-error-response-handler.service';
import { AlertService } from '../_services/alert.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
   constructor(
      private authService: AuthenticationService,
      private handlerErrorService: HttpErrorResponseHandlerService,
      private alertService: AlertService,
   ) { }

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
      return next.handle(request).pipe(
         // tap((evt) => {
         //    if (evt instanceof HttpResponse) {

         //       const accessToken = evt.headers.get(environment.accessTokenHeaderName)
         //          ? evt.headers.get(environment.accessTokenHeaderName)
         //          : null;

         //       const refreshToken = evt.headers.get('RefreshToken')
         //          ? evt.headers.get('RefreshToken')
         //          : null;
         //       const token: Token = {
         //          accessToken: accessToken,
         //          refreshToken: refreshToken,
         //       };
         //       if (accessToken && refreshToken) {
         //          this.authService.updateCurrentUser({ token: token });
         //       }
         //    }
         // }),
         // HTTP Errors:
         catchError((err: any) => {

            if (err instanceof HttpErrorResponse) {
               try {
                  // Llamar al handle error service
                  const messageError = this.handlerErrorService.handleError(null, err);
                  if (messageError) {
                     console.log(messageError);
                     this.alertService.openError(messageError);
                  } else {
                     this.alertService.openError('Ha ocurrido un error');
                  }
               } catch (e) {
                  this.alertService.openError('Ha ocurrido un error');
               }
            }
            return throwError(err);
         }),
      );
   }
}
