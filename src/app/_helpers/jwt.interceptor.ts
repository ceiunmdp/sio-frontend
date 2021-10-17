import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DniDialogComponent } from '../shared/dni-dialog/dni-dialog.component';
import { Student } from '../_models/users/user';
import { AlertService } from '../_services/alert.service';
import { AuthenticationService } from '../_services/authentication.service';
import { HttpErrorResponseHandlerService } from '../_services/http-error-response-handler.service';
import { USER_TYPES } from '../_users/types';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

   dniDialog: MatDialogRef<DniDialogComponent>;

   constructor(
      private dialogRef: MatDialog,
      private authService: AuthenticationService,
      private handlerErrorService: HttpErrorResponseHandlerService,
      private alertService: AlertService,
   ) {}

   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // Add authorization header with jwt token if available
      this.dniDialog = this.dialogRef.getDialogById('DNI_DIALOG')
      const currentUser = this.authService.currentUserValue;
      if (currentUser && (currentUser.type === USER_TYPES.ESTUDIANTE || currentUser.type === USER_TYPES.BECADO)) {
         let student = currentUser as Student;  
         if (!student.dni && (!this.dniDialog || this.dniDialog.getState() !== MatDialogState.OPEN)) this.dialogRef.open(DniDialogComponent, {id: 'DNI_DIALOG', data: {name: student.display_name}})
      }
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
                  // if (messageError) {
                  //    console.log(messageError);
                  //    this.alertService.openError(messageError);
                  // } else {
                  //    this.alertService.openError('Ha ocurrido un error');
                  // }
               } catch (e) {
                  this.alertService.openError('Ha ocurrido un error');
               }
            }
            return throwError(err);
         }),
      );
   }
}
