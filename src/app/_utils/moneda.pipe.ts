import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'moneda'
})
export class MonedaPipe extends CurrencyPipe implements PipeTransform {

  constructor() {
    super('es-Ar');
  }

  transform(value: any, args?: any): any {
    return (isNaN(+value)) ? value : super.transform(value, 'ARS', 'symbol', '1.2-2');
  }

}
