import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { API } from "src/app/_api/api";
import { ResponseMessage } from "src/app/_models/response-message";
import { environment } from "../../../environments/environment";
import { File } from "../../_models/orders/file";
import { Order } from "../../_models/orders/order";
import { Career } from "./../../_models/orders/career";
import { Course } from "./../../_models/orders/course";
import { Year } from "./../../_models/orders/year";
import { InternalOrder } from "./new-order/new-order.component";
import { Campus } from "src/app/_models/campus";
import { Item } from "src/app/_models/item";

export interface ExternalOrder {
   campusId: number;
   totalPrice: number;
   amountPaid: number;
   files: ExternalFile[];
}

export interface ExternalFile {
   id: number;
   name: string;
   quantity: number;
   sameConfiguration: boolean;
   configurations: ExternalConfiguration[];
}

export interface ExternalConfiguration {
   doubleFace: boolean;
   color: boolean;
   fromUntil: string;
   slidesPerSheet: number;
   price: number;
   ringedGroupFrontId?: number;
   ringedOrder?: number;
}

interface TreeArchivos {
   idCarrera: number;
   name: string;
   children: [
      {
         idAnio: number;
         name: string;
         children: [
            {
               idMateria: number;
               name: string;
               children: [
                  {
                     idArchivo: number;
                     cantidad_hojas: number;
                     extension: string;
                     name: string;
                  }
               ];
            }
         ];
      }
   ];
}

@Injectable({
   providedIn: "root"
})
export class OrdersService {
   constructor(private http: HttpClient) {}

   getOrders(active?: boolean): Observable<Order[]> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let params = new HttpParams();
      if (active) {
         params = params.set("active", "true");
      }
      return this.http
         .get(`${environment.apiUrl}/${API.ORDERS}`, {
            headers: queryHeaders,
            observe: "response",
            params: params
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.data;
            })
         );
   }

   getOrderById(orderId: number): Observable<Order> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");

      return this.http
         .get<Order>(`${environment.apiUrl}/${API.ORDERS}/${orderId}`, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<any>, Order>(response => {
               return response.body.data;
            })
         );
   }

   cancelOrderById(orderId: number): Observable<ResponseMessage> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");

      // ¿Falta algo para indicarle al backend que debe cancelar la orden?
      const body = new HttpParams();

      return this.http
         .put<ResponseMessage>(`${environment.apiUrl}/${API.ORDERS}/${orderId}/cancelar`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<ResponseMessage>, ResponseMessage>(response => {
               return response.body;
            })
         );
   }

   getFiles(): Observable<Career[]> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      return this.http.get(environment.apiUrl + "/files", { headers: queryHeaders, observe: "response" }).pipe(
         map<HttpResponse<any>, any>(result => {
            return this.buildTreeFiles(result.body.data);
         })
      );
   }

   postOrder(internalOrder: InternalOrder): Observable<ResponseMessage> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");

      console.log("internalOrder: ", internalOrder);
      const externalOrder = this.translateOrder(internalOrder);
      console.log("externalOrder: ", externalOrder);

      return this.http
         .post<ResponseMessage>(environment.apiUrl + "/user/orders", JSON.stringify(externalOrder), {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<ResponseMessage>, ResponseMessage>(response => {
               return response.body;
            })
         );
   }

   getCampuses(): Observable<Campus[]> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      return this.http
         .get(environment.apiUrl + "/" + API.CAMPUSES, { headers: queryHeaders, observe: "response" })
         .pipe(
            map<HttpResponse<any>, Campus[]>(result => {
               return result.body.data;
            })
         );
   }

   getItems(): Observable<Item[]> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      return this.http.get(environment.apiUrl + "/" + API.ITEMS, { headers: queryHeaders, observe: "response" }).pipe(
         map<HttpResponse<any>, any>(result => {
            const items: Item[] = result.body.data;
            return items.map(item => {
               item.maximumLimit = item.maximumLimit ? parseInt(item.maximumLimit.toString()) : null;
               item.price = item.price ? parseFloat(item.price.toString()) : null;
               return item;
            });
         })
      );
   }

   translateOrder(internalOrder: InternalOrder): ExternalOrder {
      let externalOrder: ExternalOrder = {
         amountPaid: null,
         campusId: null,
         files: null,
         totalPrice: null
      };
      externalOrder.campusId = parseInt(internalOrder.id_sede.toString());
      externalOrder.totalPrice = internalOrder.importe_total;
      externalOrder.amountPaid = internalOrder.importe_total;

      externalOrder.files = internalOrder.archivos.map(internalFile => {
         const configurations: ExternalConfiguration[] = internalFile.configuraciones.map(internalConf => {
            return {
               fromUntil: internalConf.desdehastainput,
               doubleFace: internalConf.doble_faz,
               color: internalConf.color,
               slidesPerSheet: internalConf.diap_por_hoja,
               price: internalConf.precio_archivo_config,
               ringedGroupIdFront: internalConf.id_grupo_anillado,
               ringedOrder: internalConf.orden_anillado
            };
         });
         console.log("conffff: ", configurations);

         return {
            id: internalFile.idArchivo,
            name: internalFile.name,
            quantity: internalFile.cantidad,
            sameConfiguration: internalFile.copiasMismaConfig,
            configurations: configurations
         };
      });
      return externalOrder;
   }

   buildTreeFiles(files: File[]): Career[] {
      const tree: Career[] = [];
      let career: Career | undefined;
      let year: Year | undefined;
      let course: Course | undefined;
      let file: File;

      files.forEach(fileDB => {
         file = this.createObject(fileDB, 4) as File;

         career = tree.find(career => {
            return career.id === fileDB.career!.id;
         });

         if (career) {
            year = career.children.find(year => {
               return year.id === fileDB.year;
            });

            if (year) {
               course = year.children.find(course => {
                  return course.id === fileDB.course!.id;
               });

               if (course) {
                  course.children.push(file);
               } else {
                  course = this.createObject(fileDB, 3) as Course;
                  course.children.push(file);
                  year.children.push(course);
               }
            } else {
               year = this.createObject(fileDB, 2) as Year;
               course = this.createObject(fileDB, 3) as Course;
               course.children.push(file);
               year.children.push(course);
               career.children.push(year);
            }
         } else {
            career = this.createObject(fileDB, 1) as Career;
            year = this.createObject(fileDB, 2) as Year;
            course = this.createObject(fileDB, 3) as Course;
            course.children.push(file);
            year.children.push(course);
            career.children.push(year);
            tree.push(career);
         }
      });
      return tree;
   }

   createObject(file: File, type: number): Career | Year | Course | File {
      switch (type) {
         // Career
         case 1:
            return {
               id: file.career!.id,
               name: file.career!.name,
               children: new Array<Year>()
            };
         // Year
         case 2:
            return {
               id: file.year,
               name: file.year + "° año",
               children: new Array<Course>()
            };
         // Course
         case 3:
            return {
               id: file.course!.id,
               name: file.course!.name,
               children: new Array<File>()
            };
         // File
         default:
            return {
               id: file.id,
               name: file.name,
               format: file.format,
               numberOfSheets: file.numberOfSheets,
               course: {
                  id: file.career.id,
                  name: file.course.name
               }
            };
      }
   }
}
