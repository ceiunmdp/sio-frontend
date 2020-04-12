import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Order } from "src/app/_models/orders/order";
import { HttpParams, HttpHeaders, HttpResponse, HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
   providedIn: "root"
})
export class SedeService {
   constructor(private http: HttpClient) {}

   getOrders(active?: boolean): Observable<Order[]> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let params = new HttpParams();
      if (active) {
         params = params.set("active_orders", "true");
      }
      return this.http
         .get<Order[]>(`${environment.apiUrl}/users/pedidos`, {
            headers: queryHeaders,
            observe: "response",
            params: params
         })
         .pipe(
            map<HttpResponse<Order[]>, Order[]>(response => {
               return response.body;
            })
         );
   }

   getUsers(name?: string, surname?: string, dni?: string, email?: string): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let params = new HttpParams();

      if (name) {
         params = params.append("name", name);
      }
      if (surname) {
         params = params.append("surname", surname);
      }
      if (dni) {
         params = params.append("dni", dni);
      }
      if (email) {
         params = params.append("email", email);
      }

      return this.http
         .get<any>(`${environment.apiUrl}/students`, {
            headers: queryHeaders,
            observe: "response",
            params
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.data;
            })
         );
   }

   chargeBalance(idUser: number, balance: number): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let body;

      body = {
         balance
      };

      return this.http
         .patch<any>(`${environment.apiUrl}/students/${idUser}`, JSON.stringify(body), {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }
}
