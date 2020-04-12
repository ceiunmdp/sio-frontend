import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/_services/general.service';
import { Routes } from 'src/app/_routes/routes';

interface Pedido {
   nombre: string;
   estado: string;
}

@Component({
   selector: 'cei-home-sede',
   templateUrl: './home-sede.component.html',
   styleUrls: ['./home-sede.component.scss']
})
export class HomeSedeComponent implements OnInit {
   public routes = Routes;
   pedidos: Pedido[] = [];
   displayedColumns: string[] = ['nombre', 'estado'];

   constructor() {}

   ngOnInit() {
      for (let i = 0; i < 4; i++) {
         this.pedidos.push({
            nombre: 'Pedido n°' + i.toString(),
            estado: 'Completado'
         });
      }
   }
}
