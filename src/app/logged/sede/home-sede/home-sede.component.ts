import { Component, OnInit } from '@angular/core';
import { Routes } from 'src/app/_routes/routes';
import { AuthenticationService } from 'src/app/_services/authentication.service';

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
   rootPath: string

   constructor(public authService: AuthenticationService) {}

   ngOnInit() {
      this.rootPath = this.authService.currentUserValue.rootPath;
      for (let i = 0; i < 4; i++) {
         this.pedidos.push({
            nombre: 'Pedido n°' + i.toString(),
            estado: 'Completado'
         });
      }
   }
}
