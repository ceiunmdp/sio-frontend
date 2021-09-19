import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Binding } from 'src/app/_models/binding';
import { Campus } from 'src/app/_models/campus';
import { Item } from 'src/app/_models/item';
import { File } from 'src/app/_models/orders/file';
import { Routes } from 'src/app/_routes/routes';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import Swal from 'sweetalert2';
import { _OnDataChange as dataFiles } from '../../components/files/files.component';
import { OrdersService } from '../../orders.service';

export interface UnproccesedOrder {
  campus_id: string,
  order_files: {
    file_id: string,
    file: File,
    copies: number,
    same_config: boolean,
    configurations: {
      colour: boolean,
      double_sided: boolean,
      range: number[],
      slides_per_sheet: number,
      binding_groups?: {
        id: number,
        position: number,
        binding: Binding
      }
    }[]
  }[]
}
@Component({
  selector: 'cei-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.scss']
})
export class NewOrderComponent implements OnInit {
  @ViewChild('ringOrderComponent', {static: false}) ringOrderComponent: any;
  dataFiles: dataFiles;
  dataConfigFiles;
  items: Item[];
  bindings: Binding[];
  campuses: Campus[];
  confirmOrderData;
  isPosting = false;
  messageError: string;
  rootPath: string;
  @ViewChild('alertError', { static: true }) alertError;

  constructor(private httpErrorResponseHandlerService: HttpErrorResponseHandlerService, private cd: ChangeDetectorRef, private orderService: OrdersService, private router: Router, private authService: AuthenticationService) {}

  ngOnInit() {
    this.rootPath = this.authService.currentUserValue.rootPath;
    this.getBindings().then(data => this.bindings = data.data.items).catch(error => this.handleErrors(error));
    this.getItems().then(data => this.items = data.data.items).catch(error => this.handleErrors(error));
    this.getCampuses().then(campuses => this.campuses = campuses).catch(error => this.handleErrors(error));
  }

  onStepChange(stepperSelection: StepperSelectionEvent) {
    console.log(stepperSelection);
    if (stepperSelection.selectedIndex == 3) {
      this.confirmOrderData = [...this.ringOrderComponent.configFiles];
    }
  }

  onChangeDataFiles(dataFiles: dataFiles) {

    this.dataFiles = {...dataFiles};
    // Reference a new array to force fire change detection
    this.dataFiles.data = [...dataFiles.data];
    this.cd.detectChanges();
    console.log(dataFiles)
  }

  onSubmitOrder(order) {
    this.isPosting = true;
    const body = this.orderService.mapToOrderApi(order);
    this.orderService.postNewOrder(body).toPromise()
      .then(() => {
          return this.authService.getAndUpdateUserData().toPromise();
        })
      .then(res => {
        return Swal.fire({
          title: `Pedido solicitado correctamente`,
          text: `Puede ver la evolución del pedido en el menú Mis Pedidos `,
          icon: 'success',
          confirmButtonText: 'Ok',
          showLoaderOnConfirm: true,
          allowOutsideClick: false,
        })
      })
      .then(() => {
        this.router.navigate([this.rootPath + Routes.HOME]);
      })
      .catch((error:HttpErrorResponse) => {
        let text = 'Inténtelo nuevamente más tarde';
        console.log(error, error.status);

        if(error.status == 400){
          console.log('entro', error.status);

          text = error.error.message;
        }
        Swal.fire({
          title: `Ha ocurrido un error`,
          text,
          icon: 'error',
          confirmButtonText: 'Ok',
          showLoaderOnConfirm: true,
          allowOutsideClick: false,
        })
      })
      .finally(() => this.isPosting = false);
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

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

}
