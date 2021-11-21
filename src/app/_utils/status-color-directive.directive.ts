import { Directive, Renderer2, ElementRef, Input } from '@angular/core';
import {ORDER_STATES} from '../_orderStates/states';

@Directive({
  selector: '[ceiStatusColorDirective]'
})
export class StatusColorDirectiveDirective {
  @Input() status: ORDER_STATES;
  domElement: any;

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.domElement = this.elementRef.nativeElement;
    let color: string;
    console.log('STATUUUS', status);
    switch (this.status) {
      case ORDER_STATES.SOLICITADO:
        color="#fcba03";
        break;
      case ORDER_STATES.EN_PROCESO:
        color="#00a2ff";
        break;
      case ORDER_STATES.PARA_RETIRAR:
        color="#22b335";
        break;
      default:
        break;
    }
    const requiredStyles = {
      'color': color,
    };
    Object.keys(requiredStyles).forEach(newStyle => {
      this.renderer.setStyle(
        this.domElement, `${newStyle}`, requiredStyles[newStyle]
        );
      });
  }
}
