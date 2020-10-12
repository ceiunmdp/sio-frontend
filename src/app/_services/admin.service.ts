import { Subject } from './../_models/subject';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams, HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { dataUrlToBlob } from '../_utils/utils';
import FormData from 'form-data';
// import { FileUpload } from 'src/app/modules/logged/admin/files/files.component';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

   getCareers(subjectId?: number): Observable<any[]> {
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

   editCareer(
      idCareer: number,
      name: string,
      code: string,
   ): Observable<any> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );
      const body = {
         name, code
      };

      return this.http
         .patch<any>(`${environment.apiUrl}/careers/${idCareer}`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   addCareer(name: string, code: string): Observable<any> {
      const queryHeaders = new HttpHeaders().append(
         "Content-Type",
         "application/json"
      );
      const body = {
         name,
         code
      };

      return this.http
         .post<any>(`${environment.apiUrl}/careers`, body, {
            headers: queryHeaders,
            observe: "response"
         })
         .pipe<any>(
            map<HttpResponse<any>, any>(response => {
               return response.body;
            })
         );
   }

   addSubject(name: string, code: string, careers: any): Observable<any> {
    const queryHeaders = new HttpHeaders().append(
       "Content-Type",
       "application/json"
    );
    console.log(careers)
    const body = {
       name,
       code,
       careers
    };

    return this.http
       .post<any>(`${environment.apiUrl}/subjects`, body, {
          headers: queryHeaders,
          observe: "response"
       })
       .pipe<any>(
          map<HttpResponse<any>, any>(response => {
             return response.body;
          })
       );
   }

   getSubjects(careerId?: string, page?: number): Observable<any> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let params = new HttpParams();
      if (!!careerId) {
         params = params.set("careerId", careerId);
      }
      !!page ? params = params.set("page", page.toString()) : '';

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

 getSubjectsFiles(subjectId: number, page?: number): Observable<any> {
   const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
   let params = new HttpParams();
   params = params.set("courseId", subjectId.toString());
   !!page ? params = params.set("page", page.toString()) : '';

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
}
