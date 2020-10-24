import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Routes } from '../_routes/routes';
import { AuthenticationService } from './authentication.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class HttpErrorResponseHandlerService {

    constructor(private authService: AuthenticationService, private router: Router) { }

    handleError(a, httpErrorResponse: HttpErrorResponse) {
        let message: string = '';
        const error = httpErrorResponse.error;
        if (!!error && !!error.status_code) {
            switch (error.status_code) {
                case 400: // Bad Request (Business Error)
                    message = error.message;
                    // Show the message in the component from where the call came
                    break;
                case 401: // Unauthorized
                    // Try to refresh token. Otherwise logout
                    this.authService.refreshToken().catch(e => {
                        this.authService.logout().subscribe(
                            () => {
                                this.authService.removeCurrentUser();
                                this.router.navigate([Routes.LOGIN]);
                            },
                            (err) => {
                                this.authService.removeCurrentUser();
                                this.router.navigate([Routes.LOGIN]);
                            }
                        );
                        message = 'Su sesión ha expirado';
                    })
                    break;
                case 403: // Forbidden
                    this.router.navigate([Routes.LOGIN]);
                    break;
                case 404: // Not Found
                    // TO DO
                    break;
                case 409: // Conflict
                    message = error.message;
                    // Show the message in the component from where the call came
                    break;
                case 422: // Unprocessable Entity (parameters invalid)
                    // Check how does the response comes
                    // Show the response in the appropiate form fields
                    message = error.errors[0].msg;
                    break;
                case 500: // Internal Server Error
                    // Show a message telling that the server had a problem
                    // TO DO

                    // Redirect the user to HOME
                    // this.router.navigate([Routes.LOGIN]);
                    break;
                default:
                    // Any other possible error status
                    break;
            }
        }
        return message;
    }
}
