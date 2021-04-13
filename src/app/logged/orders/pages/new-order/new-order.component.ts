import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { _OnDataChange as dataFiles } from '../../components/files/files.component';
import { OrdersService } from '../../orders.service';
import { Item } from 'src/app/_models/item';
import { Binding } from 'src/app/_models/binding';
import { Campus } from 'src/app/_models/campus';

@Component({
  selector: 'cei-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {
  @ViewChild('ringOrderComponent', { static: false }) ringOrderComponent: any;
  dataFiles: dataFiles;
  dataConfigFiles;
  items: Item[];
  bindings: Binding[];
  campuses: Campus[];
  confirmOrderData;

  constructor(private cd: ChangeDetectorRef, private orderService: OrdersService) { }

  ngOnInit() {
    this.getBindings().then(data => this.bindings = data.data.items);
    this.getItems().then(data => this.items = data.data.items);
    this.getCampuses().then(campuses => this.campuses = campuses)
  }

  onStepChange(stepperSelection: StepperSelectionEvent) {
    console.log(stepperSelection);
    if (stepperSelection.selectedIndex == 3) {
      // console.log(this.dataConfigFiles)
      // console.log(this.ringOrderComponent)
      // console.log(this.ringOrderComponent.configFiles)
      this.confirmOrderData = [...this.ringOrderComponent.configFiles];
    }
  }

  onChangeDataFiles(dataFiles: dataFiles) {

    this.dataFiles = { ...dataFiles };
    // Reference a new array to force fire change detection
    this.dataFiles.data = [...dataFiles.data];
    this.cd.detectChanges();
    console.log(dataFiles)
  }

  mostrar() {
    console.log('CAMBIO EL CONFIGFILES:', this.dataConfigFiles)
  }

  getBindings(): Promise<any> {
    return new Promise(
      (res, rej) => {
        this.orderService.getBindings().subscribe(
          bindings => {
            console.log(bindings);

            res(bindings)
          },
          error => {
            rej(error)
          }
        );
      })
  }

  getItems(): Promise<any> {
    return new Promise(
      (res, rej) => {
        this.orderService.getItems().subscribe(
          items => {
            console.log(items);

            res(items)
          },
          error => {
            rej(error)
          }
        );
      })
  }

  getCampuses(): Promise<Campus[]> {
    return new Promise(
      (res, rej) => {
        this.orderService.getCampuses().subscribe(
          data => {
            res(data.data.items)
          },
          error => {
            rej(error)
          }
        );
      })
  }

}
