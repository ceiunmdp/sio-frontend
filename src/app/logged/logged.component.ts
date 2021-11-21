import { Component, OnDestroy, OnInit, HostListener } from "@angular/core";
import { MediaChange, MediaObserver } from "@angular/flex-layout";
import { Subscription, Observable } from "rxjs";
import { Message } from "../_models/message";
import { GeneralService } from "../_services/general.service";
import {AuthenticationService} from '../_services/authentication.service';
import {USER_TYPES} from '../_users/types';
import {AdminService} from '../_services/admin.service';

@Component({
   selector: "cei-logged",
   templateUrl: "./logged.component.html",
   styleUrls: ["./logged.component.scss"]
})
export class LoggedComponent implements OnInit, OnDestroy {
   subscription: Subscription;
   message: Message;
   watcher: Subscription;
   opened: boolean;
   mode: string;
   isDarkTheme$: Observable<boolean>;
   isDarkTheme: boolean;
   prevScrollpos = 0;

   @HostListener("window:scroll", ["$event"])
   onWindowScroll(e) {
      // let element = document.querySelector('.mat-toolbar-rigth');
      // if (window.pageYOffset > element.clientHeight) {
      //     element.classList.add('mat-toolbar-rigth-scroll');
      // } else {
      //     element.classList.remove('mat-toolbar-rigth-scroll');
      // }
      let currentScrollPos = window.pageYOffset;
      let ref;
      ref = <any>document.querySelector(".toolbar-right");
      if (this.isDarkTheme) {
         if (currentScrollPos == 0) {
            ref.classList.remove("mat-toolbar-right-alt");
            ref.classList.remove("mat-elevation-z6");
         } else {
            if (!ref.classList.contains("mat-toolbar-right-alt")) {
               ref.classList.add("mat-toolbar-right-alt");
            }
            if (!ref.classList.contains("mat-elevation-z6")) {
               ref.classList.add("mat-elevation-z6");
            }
         }
      }

      // if (this.prevScrollpos > currentScrollPos) {
      //    if (this.isDarkTheme$) {
      //       (<any>document.querySelector(".mat-toolbar-right-alt")).style.top = "0";
      //    } else {
      //       (<any>document.querySelector(".mat-toolbar-right")).style.top = "0";
      //    }
      // } else {
      //    if (this.isDarkTheme$) {
      //       (<any>document.querySelector(".mat-toolbar-right-alt")).style.top = "-70px";
      //    } else {
      //       (<any>document.querySelector(".mat-toolbar-right")).style.top = "-70px";
      //    }
      // }
      // this.prevScrollpos = currentScrollPos;
   }

   constructor(private adminService: AdminService, private authService: AuthenticationService,private generalService: GeneralService, public mediaObserver: MediaObserver) { }

   ngOnInit() {
      console.log('entro en cei');

      this.isDarkTheme$ = this.generalService.getDarkTheme();
      this.isDarkTheme$.subscribe(isDark => (this.isDarkTheme = isDark));

      this.subscription = this.generalService.getMessage().subscribe(message => {
         this.message = message;
      });

      // tslint:disable-next-line: deprecation
      this.watcher = this.mediaObserver.media$.subscribe((change: MediaChange) => {
         if (change.mqAlias === "xs" || change.mqAlias === "sm") {
            this.onMobile();
         } else {
            this.onDesktop();
         }
      });

      this.authService.getAndUpdateUserData().toPromise()
        .then((): any => {
          if (this.authService.currentUserValue.type === USER_TYPES.ADMIN) {
            return this.adminService.getServerStatus().toPromise();
          }
          return Promise.resolve();
        })
        .then(response => {
          this.authService.updateCurrentUser({serverStatus: response.data})
        });

        this.authService.getParameters().toPromise()
        .then(response => {
          this.authService.updateCurrentUser({links: response.data.items})
        })
   }

   ngOnDestroy() {
      // Unsubscribe to ensure no memory leaks
      this.subscription.unsubscribe();
   }

   onMobile() {
      this.opened = false;
      this.mode = "over";
   }

   onDesktop() {
      this.opened = true;
      this.mode = "side";
   }
}
