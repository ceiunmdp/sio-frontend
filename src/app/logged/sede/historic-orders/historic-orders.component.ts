import { Component, OnInit } from "@angular/core";
import { GeneralService } from "src/app/_services/general.service";

@Component({
   selector: "cei-historic-orders",
   templateUrl: "./historic-orders.component.html",
   styleUrls: ["./historic-orders.component.scss"]
})
export class HistoricOrdersComponent implements OnInit {
   public readonly TITLE = "Historial de pedidos  ";

   constructor(private generalService: GeneralService) {}

   ngOnInit() {
      this.generalService.sendMessage({ title: this.TITLE });
   }
}
