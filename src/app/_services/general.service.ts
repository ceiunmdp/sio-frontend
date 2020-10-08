import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { API } from '../_api/api';
import { Message } from '../_models/message';
import { Functionality } from '../_models/menu/functionality';

@Injectable({
   providedIn: 'root'
})
export class GeneralService {
   // tslint:disable-next-line: variable-name
   private _message = new Subject<Message>();
   // tslint:disable-next-line: variable-name
   private _darkTheme: Subject<boolean> = new BehaviorSubject(false
   );

   constructor(
      private http: HttpClient,
      private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer
   ) { }

   getDarkTheme(): Observable<boolean> {
      return this._darkTheme.asObservable();
   }

   setDarkTheme(isDarkTheme: boolean) {
      this._darkTheme.next(isDarkTheme);
   }

   getMessage(): Observable<Message> {
      return this._message.asObservable();
   }

   sendMessage(message: Message) {
      this._message.next(message);
   }

   clearMessage() {
      this._message.next();
   }

   addIcon(nameIcon: string, fileName: string) {
      this.matIconRegistry.addSvgIcon(
         nameIcon,
         this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/' + fileName)
      );
   }

   getMenu(): Observable<Functionality> {
      const queryHeaders = new HttpHeaders().append('Content-Type', 'application/json');

      return this.http
         .get(`${environment.apiUrl}/${API.MENU}`, {
            headers: queryHeaders,
            observe: 'response'
         })
         .pipe(
            map<HttpResponse<any>, any>(response => {
               return response.body.data;
            })
         );
   }
}
