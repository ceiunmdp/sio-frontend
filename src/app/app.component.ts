import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { GeneralService } from "./_services/general.service";

@Component({
   selector: "cei-root",
   templateUrl: "./app.component.html",
   styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
   isDarkTheme$: Observable<boolean>;

   constructor(private generalService: GeneralService) {}

   ngOnInit() {
      this.isDarkTheme$ = this.generalService.getDarkTheme();
      this.addIcons();
   }

   // Add icons gloabally
   addIcons() {
      this.generalService.addIcon("customCircle", "circle.svg");
      this.generalService.addIcon("facebook", "facebook.svg");
      this.generalService.addIcon("instagram", "instagram.svg");
      this.generalService.addIcon("twitter", "twitter.svg");
      this.generalService.addIcon("nuevo_pedido", "nuevo_pedido.svg");
      this.generalService.addIcon("cargar_saldo", "cargar_saldo.svg");
      this.generalService.addIcon("transferir_saldo", "transferir_saldo.svg");
      this.generalService.addIcon("mis_pedidos_simple", "clipboard.svg");
      this.generalService.addIcon("pedidos_en_curso", "checklist_hand.svg");
      this.generalService.addIcon("pedidos_en_curso_simple", "checklist_ticks.svg");
      this.generalService.addIcon("nuevo_pedido_simple", "add_to_cart.svg");
      this.generalService.addIcon("transferir_saldo_simple", "transferir_saldo_simple.svg");
      this.generalService.addIcon("transferir", "transfer.svg");
      this.generalService.addIcon("movimientos", "movimientos.svg");
      this.generalService.addIcon("mis_pedidos", "mis_pedidos.svg");
   }
}
