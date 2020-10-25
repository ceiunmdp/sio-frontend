import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import _ from 'lodash'

@Injectable({
   providedIn: 'root'
})
export class RestUtilitiesService {

   constructor() { }

   formatQPs = (qps: {}): { param: string, value: string }[] => {
      return _.map(qps, (value, key): { param: string, value: string } => {
         if (key == 'sort') value = value.map(sort => sort.field + ' ' + sort.sort).join(',');
         return {
            param: key,
            value: value.toString()
         };
      });
   }

   formatCreateAndAppendQps = (qps: {}): HttpParams => {
      for (var propName in qps) {
         if (qps[propName] === null || qps[propName] === undefined) {
            delete qps[propName];
         }
      }
      return this.createAndAppendQps(this.formatQPs(qps));
   }

   private createAndAppendQps = (qpsProcessed: { param: string, value: string }[]): HttpParams => {
      let queryParams = new HttpParams();

      qpsProcessed.forEach(qp => {
         queryParams = queryParams.append(qp.param, qp.value);
      })
      return queryParams;
   }
}
