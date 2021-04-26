import {Component, OnInit, Input, SimpleChanges, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';
import {Campus} from 'src/app/_models/campus';
import {CustomValidators} from 'src/app/_validators/custom-validators';
import {Binding} from 'src/app/_models/binding';
import {MatTableDataSource} from '@angular/material';
import {OrdersService, PRICES_CODES} from '../../orders.service';

@Component({
  selector: 'cei-confirm-order',
  templateUrl: './confirm-order.component.html',
  styleUrls: ['./confirm-order.component.scss']
})
export class ConfirmOrderComponent implements OnInit {
  @Input() campuses: Campus;
  @Input() order;
  @Input() prices;
  @Input() isPosting;
  @Output('submit') finalOrder = new EventEmitter;
  totalPrice: number = 0;
  dataSource: MatTableDataSource<any>;
  bindingsDetail: Binding[];
  filesDetail: any[];
  confirmOrderForm: FormGroup;
  public readonly CAMPUS = 'campus_id' // Form array ppal
  displayedColumns: string[] = ["file", "quantity", "totalPages", "unitPrice", "totalPrice"];

  constructor(private formBuilder: FormBuilder, private orderService: OrdersService) {}


  ngOnInit() {
    console.log(this.prices);

    this.confirmOrderForm = this.createConfirmOrderForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (!!changes && !!changes.order && !!changes.order.currentValue) {
      this.bindingsDetail = this.getBindingsFromOrder(this.order);
      this.filesDetail = this.getFilesFromOrder(this.order);
      this.dataSource = new MatTableDataSource(this.filesDetail.concat(this.bindingsDetail));
      this.totalPrice = this.calculateTotalPrice();
    }
  }

  calculateTotalPrice = (): number => this.dataSource.data.reduce((accum, current) => accum += current.totalPrice, 0)


  getBindingsFromOrder(order) {
    const bindings: Binding[] = [];
    order.forEach(file => {
      file.configurations.forEach(configuration => {
        if (!!configuration.binding_groups) {
          // if the binding has not yet been inserted
          const existingBindingIndex = bindings.findIndex(binding => binding.id == configuration.binding_groups.id);
          if (existingBindingIndex == -1) {
            bindings.push({...configuration.binding_groups.binding, id: configuration.binding_groups.id})
          } else {
            const existingBinding = bindings[existingBindingIndex];
            if (configuration.binding_groups.binding.sheets_limit > existingBinding.sheets_limit) {
              bindings[existingBindingIndex] = {...configuration.binding_groups.binding, id: configuration.binding_groups.id};
            }
          }
        }
      })
    });
    const bindingsProccesed = bindings.reduce((bindingsProccesed, binding, indexBinding, bindings) => {
      const bindingProccesedIndex = bindingsProccesed.findIndex(bindingProccesed => bindingProccesed.name == binding.name);
      if (bindingProccesedIndex != -1) {
        bindingsProccesed[bindingProccesedIndex]['quantity']++;
        bindingsProccesed[bindingProccesedIndex]['totalPrice'] += bindingsProccesed[bindingProccesedIndex]['unitPrice'];
        return bindingsProccesed;

      } else {
        return [...bindingsProccesed, {...binding, quantity: 1, unitPrice: Number(binding.price), totalPrice: Number(binding.price)}]
      }
    }, [])
    console.log('ANILLADOS FINAL: ', bindingsProccesed);
    return bindingsProccesed;
  }

  getFilesFromOrder(order) {
    const obtainFile = (configuration, copies, name) => {
      const range = configuration.range;
      const double_sided = configuration.double_sided;
      const slidesPerSheet = configuration.slides_per_sheet;
      // const unitVeneers = this.orderService.calculateVeneers(range);
      // const totalVeneers = unitVeneers * file.copies;
      const unitPages = this.orderService.calculatePages(range, double_sided, slidesPerSheet);
      const totalPages = unitPages * copies;
      const colour = configuration.colour;
      const unitPrice = this.calculatePrice(unitPages, colour, double_sided);
      const totalPrice = unitPrice * copies;
      return {
        name,
        quantity: copies,
        // unitVeneers,
        // totalVeneers,
        unitPages,
        totalPages,
        double_sided,
        colour,
        unitPrice,
        totalPrice
      }
    };
    const files = [];
    order.forEach(file => {
      if (file.same_config) {
        const name = `${file.file.name} (${file.file.courses[0].name})`;
        const _file = obtainFile(file.configurations[0], file.copies, name)
        files.push(_file);
      } else {
        file.configurations.forEach(configuration => {
          const name = `${file.file.name} (${file.file.courses[0].name})`;
          const _file = obtainFile(configuration, 1, name);
          files.push(_file);
        })
      }
    });
    return files;
  }

  calculatePrice(pages, colour, double_sided): number {
    // TODO: Ver como calcular si eligen color.
    const doubleSidedPrice = this.prices.find(price => price.code == PRICES_CODES.double_sided).price;
    const simpleSidedPrice = this.prices.find(price => price.code == PRICES_CODES.simple_sided).price;
    const colourPrice = this.prices.find(price => price.code == PRICES_CODES.colour).price;
    let price;
    console.log('Cantidad de paginas', pages);
    console.log('Precio de doble faz', doubleSidedPrice);
    console.log('Precio de simple faz', simpleSidedPrice);

    if (double_sided) {
      price = pages * doubleSidedPrice;
    } else {
      price = pages * simpleSidedPrice;
    }
    return price;
  }

  createConfirmOrderForm(): FormGroup {
    return this.formBuilder.group({
      [this.CAMPUS]: [this.campuses[0].id.toString(), [CustomValidators.required('La sede es requerida')]]
    });
  }

  onSubmit() {
    this.finalOrder.emit({...this.confirmOrderForm.value, order_files: this.order});
  }

  calculateIdCampus = (element) => element.id
  calculateNameCampus = (element) => element.name
}
