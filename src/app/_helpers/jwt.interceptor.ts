import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material';
import { Observable, of, throwError } from 'rxjs';
import { catchError, mergeMap, tap } from 'rxjs/operators';
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
      private afAuth: AngularFireAuth
   ) {}

   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // Add authorization header with jwt token if available
      console.log('CONSOLA', this.afAuth.auth);
      return of(null).pipe(
        mergeMap(() => {
          if (this.afAuth.auth && this.afAuth.auth.currentUser) {
            console.log('entro en refrescar token');
            return this.authService.verifyAndUpdateToken();
          }
          return of(null);
        }),
        tap((res) => {
            console.log('RESPUESTA', res);
            this.dniDialog = this.dialogRef.getDialogById('DNI_DIALOG');
            const currentUser = this.authService.currentUserValue;
            if (currentUser && (currentUser.type === USER_TYPES.ESTUDIANTE || currentUser.type === USER_TYPES.BECADO)) {
              const student = currentUser as Student;
              console.log('DIALOG', this.dniDialog)
              if (!student.dni && (!this.dniDialog || this.dniDialog.getState() !== MatDialogState.OPEN)) {
                this.dialogRef.open(DniDialogComponent, {id: 'DNI_DIALOG', data: {name: student.display_name}});
              }
            }
            if (currentUser && currentUser.token) {
              request = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${currentUser.token}`
                  }
              //    if (evt instanceof HttpResponse) {

              //       const accessToken = evt.headers.get(environment.accessTokenHeaderName)
              //          ? evt.headers.get(environment.acces
              });
            } else {
              // console.log('No entró en el interceptor');
            }
        }),
        mergeMap(() => next.handle(request)),
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
        })
      );
   }
}
