import { Component, OnInit } from '@angular/core';
import { GeneralService } from 'src/app/_services/general.service';
import { Movement } from 'src/app/_models/movement';
import { MovementService } from 'src/app/_services/movement.service';

@Component({
   selector: 'cei-movements',
   templateUrl: './movements.component.html',
   styleUrls: ['./movements.component.scss']
})
export class MovementsComponent implements OnInit {
   public readonly TITLE = 'Mis movimientos';
   public movements: Movement[];
   constructor(public generalService: GeneralService, public movementService: MovementService) {}

   ngOnInit() {
      this.generalService.sendMessage({ title: this.TITLE });
      this.addIcons();
      this.movementService.getAllMovements().subscribe(movements => {
         this.movements = movements;
      });

      //   this.movements.push(new Movement(1, 'yo', 'Anexo', 100, 'Carga de saldo', 'load-move', new Date()));
      //   this.movements.push(
      //      new Movement(
      //         2,
      //         'Sebastian Canonaco',
      //         'Manuel Nucci',
      //         100,
      //         'Transferencia de saldo',
      //         'transfer-move',
      //         new Date()
      //      )
      //   );
      //   this.movements.push(
      //      new Movement(
      //         3,
      //         'Emanuel Ponce',
      //         'Sebastian Canonaco',
      //         100,
      //         'Transferencia de saldo',
      //         'transfer-move',
      //         new Date()
      //      )
      //   );
      //   this.movements.push(new Movement(4, 'Sebastian Canonaco', 'Central', 100, 'Pedido', 'order-move', new Date()));
   }

   private addIcons() {
      this.generalService.addIcon('transfer-move', 'transfer.svg');
      this.generalService.addIcon('order-move', 'file.svg');
      this.generalService.addIcon('load-move', 'money.svg');
   }
}
