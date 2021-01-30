import { RestUtilitiesService } from './rest-utilities.service';
import { Parameter } from './../_models/parameter';
import { ResponseAPI } from './../_models/response-api';
import { Pagination } from './../_models/pagination';
import { Sort } from './../_models/sort';
import { Binding } from './../_models/binding';
import { Career } from './../_models/orders/career';
import { FilterBuilder, OPERATORS, AND, OR } from './../_helpers/filterBuilder';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams, HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { dataUrlToBlob } from '../_utils/utils';
import FormData from 'form-data';
import { Course } from '../_models/orders/course';
import { API } from '../_api/api';
// import { FileUpload } from 'src/app/modules/logged/admin/files/files.component';

export interface CoursePost {
   name: string,
   relations: {
      id: string,
      careers_ids: string[]
   }[]
}

export interface CareerPost {
   name: string
}

export interface ItemPost {
   price: number;
}

export interface ParameterPatch {
   value: number;
}

export interface BindingPost extends ItemPost {
   name: string;
   sheets_limit: number;
}

@Injectable({
   providedIn: 'root'
})
export class AdminService {

   constructor(private http: HttpClient, private restService: RestUtilitiesService) { }

   getCareers(subjectId?: number): Observable<Career[]> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let params = new HttpParams();
      if (subjectId) {
         params = params.set("subjectId", subjectId.toString());
      }
      return this.http
         .get(`${environment.apiUrl}/careers`, {
            headers: queryHeaders,
            observe: "response",
            params: params
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.data.items;
            })
         );
   }

   postCareer(body: CareerPost): Observable<Career> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );

      return this.http
         .post<any>(`${environment.apiUrl}/${API.CAREERS}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }


   patchCareer(
      body: CareerPost,
      idCareer: string
   ): Observable<Career> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );

      return this.http
         .patch<any>(`${environment.apiUrl}/${API.CAREERS}/${idCareer}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   deleteCareer(careerId: string): Observable<Career> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );
      return this.http
         .delete<any>(`${environment.apiUrl}/${API.CAREERS}/${careerId}`, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   postCourse(body: CoursePost): Observable<Course> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );
      console.log('Body del post de materias: ', body);
      return this.http
         .post<any>(`${environment.apiUrl}${API.COURSES}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   patchCourse(body: CoursePost, courseId: string): Observable<Course> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );
      return this.http
         .patch<any>(`${environment.apiUrl}${API.COURSES}/${courseId}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   deleteCourse(courseId: string): Observable<Course> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );
      return this.http
         .delete<any>(`${environment.apiUrl}${API.COURSES}/${courseId}`, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   getSubjects(careerId?: string): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let params = new HttpParams();
      if (!!careerId) {
         params = params.set("careerId", careerId);
      }

      return this.http
         .get(`${environment.apiUrl}/courses`, {
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

   getSubjectById(subjectId: number): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");

      return this.http
         .get(`${environment.apiUrl}/subjects/${subjectId}`, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.data;
            })
         );
   }

   editSubject(
      idSubject: number,
      name: string,
      code: string,
      careers: any[]
   ): Observable<any> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );
      const body = {
         name, code, careers
      };

      return this.http
         .patch<any>(`${environment.apiUrl}/subjects/${idSubject}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   getRelations(): Observable<any[]> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      return this.http
         .get(`${environment.apiUrl}/relations`, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.data;
            })
         );
   }

   uploadFiles(coursesId: string, files: any[]): Observable<any> {
      var blobFiles: Blob[]
      blobFiles = files.map((file, _, __) => {
         return dataUrlToBlob(file.dataUrl)
      })

      var fileNames: string[]
      fileNames = files.map((file, _, __) => file.name)

      const formData = new FormData();
      formData.append("courses_ids", coursesId);
      blobFiles.forEach((file, i, __) => {
         formData.append(`files`, file, fileNames[i]);
      })

      return this.http
         .post<any>(`${environment.apiUrl}/files/bulk`, formData, {
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   getSubjectsFiles(subjectId: number): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let params = new HttpParams();
      const fb = new FilterBuilder();
      const filter = fb.and(fb.where('course_id', OPERATORS.IS, subjectId));
      params = params.set("filter", JSON.stringify(filter));

      return this.http
         .get(`${environment.apiUrl}/files`, {
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

   onEditSubjectsFiles(
      idFile: number,
      name: string
   ): Observable<any> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );
      const body = {
         name
      };

      return this.http
         .patch<any>(`${environment.apiUrl}/files/${idFile}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   deleteFile(fileId): Observable<any> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );

      return this.http
         .delete<any>(`${environment.apiUrl}/files/${fileId}`, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   patchItem(
      body: ItemPost,
      idItem: string
   ): Observable<Career> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );

      return this.http
         .patch<any>(`${environment.apiUrl}/${API.ITEMS}/${idItem}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   postBinding(body: BindingPost): Observable<Binding> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );

      return this.http
         .post<any>(`${environment.apiUrl}/${API.ITEMS}/${API.BINDINGS}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   patchBinding(
      body: BindingPost,
      idBinding: string
   ): Observable<Binding> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );

      return this.http
         .patch<any>(`${environment.apiUrl}/${API.ITEMS}/${API.BINDINGS}/${idBinding}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   deleteBinding(bindingId: string): Observable<Binding> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );
      return this.http
         .delete<any>(`${environment.apiUrl}/${API.ITEMS}/${API.BINDINGS}/${bindingId}`, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   getParameters(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<ResponseAPI<Parameter[]>> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      const params: HttpParams = this.restService.formatCreateAndAppendQps({ filter, sort, pagination })
      return this.http
         .get(`${environment.apiUrl}/${API.PARAMETERS}`, {
            headers: queryHeaders,
            observe: "response",
            params: params
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   patchParameter(
      body: ParameterPatch,
      idParameter: string
   ): Observable<Parameter> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );

      return this.http
         .patch<any>(`${environment.apiUrl}/${API.PARAMETERS}/${idParameter}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

}
