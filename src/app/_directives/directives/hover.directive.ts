import { Directive, ElementRef } from '@angular/core';

@Directive({
   selector: '[ceiHover]'
})
export class HoverDirective {
   constructor(private el: ElementRef) {
      this.el.nativeElement.style.backgroundColor = 'yellow';
   }

   ngOnInit() {}
}
