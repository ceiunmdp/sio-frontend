import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { API } from '../_api/api';
import { Movement } from '../_models/movement';
import { ResponseAPI } from '../_models/response-api';
import { MOVEMENTS } from '../_movements/movements';

@Injectable({
   providedIn: 'root'
})
export class MovementService {

   constructor(private http: HttpClient) { }

   public getAllMovements(): Observable<Movement[]> {
      const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');

      return this.http
         .get<Movement[]>(`${environment.apiUrl}${API.MOVEMENTS}`, {
            headers: queryHeaders,
            observe: 'response'
         })
         .pipe<Movement[]>(
            map<HttpResponse<Movement[]>, Movement[]>(res => {
               const movements = res.body;
               return this.formatMovements(movements);
            })
         );
   }

   createMovement(sourceId: string, targetId: string, transferType: MOVEMENTS, amount: number): Observable<ResponseAPI<Movement>> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let body = {
         amount,
         type: {
            code: transferType
         },
         source_id: sourceId,
         target_id: targetId,
      };

      return this.http
        .post<ResponseAPI<Movement>>(`${environment.apiUrl}${API.MOVEMENTS}`, body, {
          headers: queryHeaders,
          observe: "response"
        })
        .pipe(
          map<HttpResponse<ResponseAPI<Movement>>, ResponseAPI<Movement>>(response => {
            return response.body;
          })
        );
    }

   private formatMovements(movements: Movement[]): Movement[] {
      // movements.forEach((movement, index, array) => {
      //    switch (movement.tipo) {
      //       case this.TIPO_MOV_TRANSFERENCIA_ENTRANTE:
      //          movement.icon = 'transfer-move';
      //          movement.description = `Transferencia de saldo entrante de ${movement.usuarioOrigen}`;
      //          break;
      //       case this.TIPO_MOV_TRANSFERENCIA_SALIENTE:
      //          movement.icon = 'transfer-move';
      //          movement.description = `Transferencia de saldo saliente a ${movement.usuarioDestino}`;
      //          movement.importe = -movement.importe;
      //          break;
      //       case this.TIPO_MOV_PEDIDO:
      //          movement.icon = 'order-move';
      //          movement.description = `Pedido realizado en ${movement.usuarioDestino}`;
      //          break;
      //       case this.TIPO_MOV_CARGA_SALDO:
      //          movement.icon = 'load-move';
      //          movement.description = `Carga de saldo realizada en ${movement.usuarioOrigen}`;
      //          break;
      //       default:
      //          break;
      //    }
      // });
      return null;
   }
}
