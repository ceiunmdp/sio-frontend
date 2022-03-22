import { Component, OnInit } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
   selector: 'app-spinner',
   templateUrl: './spinner.component.html',
   styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent implements OnInit {
   // Lottie
   optionsLottie: AnimationOptions = {
      path: 'assets/animations/loading.json',
   };
   constructor() { }

   ngOnInit() { }

   animationCreated(animationItem: AnimationItem): void {
      console.log(animationItem);
   }
}
