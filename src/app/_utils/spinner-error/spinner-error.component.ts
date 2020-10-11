import { Component, OnInit } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
   selector: 'app-spinner-error',
   templateUrl: './spinner-error.component.html',
   styleUrls: ['./spinner-error.component.scss'],
})
export class SpinnerErrorComponent implements OnInit {
   // Lottie
   optionsLottie: AnimationOptions = {
      path: 'assets/animations/error.json',
      // loop: false
   };
   constructor() { }

   ngOnInit() { }

   animationCreated(animationItem: AnimationItem): void {
      console.log(animationItem);
   }
}
