import { Component, OnInit, HostListener } from "@angular/core";
import { Observable } from "rxjs";
import { GeneralService } from "./_services/general.service";
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';
// import { BreadcrumbService } from 'xng-breadcrumb';

@Component({
   selector: "cei-root",
   templateUrl: "./app.component.html",
   styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
   isDarkTheme$: Observable<boolean>;


   deferredPrompt: any;
   showButton = false;

   constructor(private generalService: GeneralService) { }

   ngOnInit() {
      this.isDarkTheme$ = this.generalService.getDarkTheme();
      this.addIcons();
   }

   @HostListener('window:beforeinstallprompt', ['$event'])
   onbeforeinstallprompt(e) {
      console.log('entroooooooooooo', e);
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e;
      this.showButton = true;
   }

   addToHomeScreen() {
      // hide our user interface that shows our A2HS button
      this.showButton = false;
      // Show the prompt
      this.deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      this.deferredPrompt.userChoice
         .then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
               console.log('User accepted the A2HS prompt');
            } else {
               console.log('User dismissed the A2HS prompt');
            }
            this.deferredPrompt = null;
         });
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
      this.generalService.addIcon("scholarship", "scholarship.svg");
   }
}
