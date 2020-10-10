import { Subject } from './../_models/subject';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams, HttpClient, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
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

   getSubjects(careerId?: number): Observable<Subject[]> {
      const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
      let params = new HttpParams();
      if (careerId) {
         params = params.set("careerId", careerId.toString());
      }

      return this.http
         .get(`${environment.apiUrl}/courses`, {
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

   uploadFiles(courseId: string, files: any[]): Observable<any> {
    const queryHeaders = new HttpHeaders().append(
       "Content-Type",
       "multipart/form-data; boundary=something"
    ).append(
       "Authorization",
       "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjIzNzA1ZmNmY2NjMTg4Njg2ZjhhZjkyYWJiZjAxYzRmMjZiZDVlODMiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQWRtaW4iLCJpZCI6ImNlNzUzMWUyLWMxNDYtNDVjMC1hMDFmLWVhZDdhMjcyNTNiZSIsInJvbGUiOiJBZG1pbiIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9pY2VpLWQzYzk0IiwiYXVkIjoiaWNlaS1kM2M5NCIsImF1dGhfdGltZSI6MTYwMjMzNTExNCwidXNlcl9pZCI6ImNlNzUzMWUyLWMxNDYtNDVjMC1hMDFmLWVhZDdhMjcyNTNiZSIsInN1YiI6ImNlNzUzMWUyLWMxNDYtNDVjMC1hMDFmLWVhZDdhMjcyNTNiZSIsImlhdCI6MTYwMjMzNTExNCwiZXhwIjoxNjAyMzM4NzE0LCJlbWFpbCI6ImFkbWluQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.HywmbBP9yFtX_RD6nJhUSqs5OrmZm4Yj5ZAW4ktsSy8u2Eu-ErP7bXYhcdm8MvL0Da54XaRR1A_cWp1kb-KWlYs-LF_4rAKxrS5WiCg-ALRAFItqxxcJohAHqKygetmmh-kpS3ybA9C63sW72fttsgezYIBjcoS5kq6gFsmCcCs_wAen6d_JyuNxFt8VHwvn2oEU1VrRRoNVKrVrzKTkOZ8xhtbAHeVYPcSFO_kAPXXuLrduj2HYJ0BH8imCg0EGIHK4ROaSv08SUTw7NQwBUK5_fU5rggTpluxRo4Ipxoz5fU_OTS_bBltyqYY_OQJEP08ZzmuOj037ZEWmolGy6g"
    );
    const formData = new FormData();
    formData.append("courses_ids", /*courseId*/"9aa481e3-5552-46f3-a8d1-9fe27aebb17c");
    files.forEach((file, i, array) => {
      formData.append("files[]", file);
    })

    return this.http
       .post<any>(`${environment.apiUrl}/files/bulk`, formData, {
          headers: queryHeaders,
          observe: "response"
       })
       .pipe<any>(
          map<HttpResponse<any>, any>(response => {
             return response.body;
          })
       );
 }

 getSubjectsFiles(subjectId: number): Observable<any[]> {
  const queryHeaders = new HttpHeaders().append("Content-Type", "application/json");
  let params = new HttpParams();
  params = params.set("courseId", subjectId.toString());

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
