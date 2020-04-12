import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { UserLogin } from "../_models/users/user-login";
import { Message } from "@angular/compiler/src/i18n/i18n_ast";
import { API } from "../_api/api";
import { UserRegister } from "../_models/users/user-register";

export interface LoginResponse {
   token: string;
}

@Injectable({
   providedIn: "root"
})
export class UnloggedService {
   constructor(public http: HttpClient) {}

   login(userLogin: UserLogin): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");

      const body = {
         username: userLogin.email,
         password: userLogin.password
      };

      return this.http
         .post<LoginResponse>(`${environment.apiUrl}/${API.LOGIN}`, JSON.stringify(body), {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.data;
            })
         );
   }

   register(user: UserRegister): Observable<string> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");

      const body = {
         name: user.name,
         surname: user.surname,
         email: user.email,
         dni: user.dni,
         password: user.password
      };

      return this.http
         .post<LoginResponse>(`${environment.apiUrl}/users`, JSON.stringify(body), {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.message;
            })
         );
   }
}
