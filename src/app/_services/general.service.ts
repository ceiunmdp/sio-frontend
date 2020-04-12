import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { API } from '../_api/api';
import { Module } from '../_models/menu/module';
import { Message } from '../_models/message';
import { AuthenticationService } from './authentication.service';

@Injectable({
   providedIn: 'root'
})
export class GeneralService {
   // tslint:disable-next-line: variable-name
   private _message = new Subject<Message>();
   // tslint:disable-next-line: variable-name
   private _darkTheme: Subject<boolean> = new BehaviorSubject(
      this.authService.currentUserValue ? !!this.authService.currentUserValue.darkTheme : false
   );
   // isDarkTheme$: Observable<boolean>;

   constructor(
      private http: HttpClient,
      private authService: AuthenticationService,
      private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer
   ) {}

   getDarkTheme(): Observable<boolean> {
      return this._darkTheme.asObservable();
   }

   setDarkTheme(isDarkTheme: boolean) {
      // if (this._darkTheme === null) {
      //    this._darkTheme = new BehaviorSubject(isDarkTheme);
      //    this.isDarkTheme$ = this._darkTheme.asObservable();
      // }
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

   getMenu(): Observable<Module> {
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
