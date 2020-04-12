import { Component, OnInit } from "@angular/core";
import { Routes } from "../_routes/routes";

@Component({
   selector: "cei-not-found",
   templateUrl: "./not-found.component.html",
   styleUrls: ["./not-found.component.scss"]
})
export class NotFoundComponent implements OnInit {
   routes = Routes;

   constructor() {}

   ngOnInit() {}
}
