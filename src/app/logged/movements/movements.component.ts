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
      // this.movementService.getAllMovements().subscribe(movements => {
      //    this.movements = movements;
      // });

   }
}
