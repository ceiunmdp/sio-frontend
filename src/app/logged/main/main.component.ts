import { Component, OnInit } from "@angular/core";
import {Router} from "@angular/router";
import {AuthenticationService} from "src/app/_services/authentication.service";

@Component({
   selector: "main-cei",
   templateUrl: "./main.component.html"
})
export class MainComponent {

  constructor(private authService: AuthenticationService, private router: Router) {
    const user = this.authService.currentUserValue;
    const rootPath = user.rootPath;
    router.navigate([rootPath]);
  }
}
