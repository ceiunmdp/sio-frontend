import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Order } from "src/app/_models/orders/order";
import { HttpParams, HttpHeaders, HttpResponse, HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { OR, AND } from 'src/app/_helpers/filterBuilder';
import { ResponseAPI } from 'src/app/_models/response-api';
import { RestUtilitiesService } from 'src/app/_services/rest-utilities.service';
import { API } from 'src/app/_api/api';
import { Student } from 'src/app/_models/users/user';
import { Pagination } from 'src/app/_models/pagination';
import { Sort } from 'src/app/_models/sort';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import {Printer} from "src/app/_models/printer";

@Injectable({
   providedIn: "root"
})
export class SedeService {
   constructor(private http: HttpClient, private restService: RestUtilitiesService, private authService: AuthenticationService) { }

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

   getStudents(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Student[]>> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination })
      return this.http.get(environment.apiUrl + API.USERS_STUDENTS,
         {
            headers: queryHeaders,
            observe: "response",
            params
         }).pipe(
            map<HttpResponse<ResponseAPI<Student[]>>, ResponseAPI<Student[]>>(result => {
               return result.body;
               // return careers.map((careerResponse: CareerResponse) => { const career: any = careerResponse; career.children = []; career.type = TREE_TYPES.CAREER; return career });
               // return this.buildTreeFiles(result.body.data);
            })
         );
   }

   chargeBalance(idUser: number, amount: number): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let body;

      body = {
         amount,
         type: {
            // TODO: Pasar a enum
            code: "top_up"
         },
         source_id: this.authService.currentUserValue.id,
         target_id: idUser,
      };
      return this.http
         .post<any>(`${environment.apiUrl}${API.MOVEMENTS}`, JSON.stringify(body), {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   patchOrderFile(orderId: number, orderFileId: number, stateCode: string, printer_id?: string): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let body;
      body = {
         state: {
            code: stateCode
         },
         // ! Test printer
         ...(!!printer_id && { printer_id })
      };
      return this.http
         .patch<any>(`${environment.apiUrl}/orders/${orderId}/order-files/${orderFileId}`, JSON.stringify(body), {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.data;
            })
         );
   }

   patchOrderRing(orderId: number, ringGroupId: number, stateCode: string): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let body;

      body = {
         state: {
            code: stateCode
         }
      };

      return this.http
         .patch<any>(`${environment.apiUrl}/orders/${orderId}/binding-groups/${ringGroupId}`, JSON.stringify(body), {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.data;
            })
         );
   }

   patchOrder(orderId: string, stateCode: string): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let body;
      body = {
         state: {
            code: stateCode
         }
      };
      return this.http
         .patch<any>(`${environment.apiUrl}/orders/${orderId}`, JSON.stringify(body), {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.data;
            })
         );
   }

   getPrinters() {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      return this.http.get(environment.apiUrl + API.PRINTERS,
          {
            headers: queryHeaders,
            observe: "response",
          }).pipe(
            map<HttpResponse<ResponseAPI<Printer[]>>, any>(result => {
                return result.body.data;
            })
          );
   }
}
