import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatBottomSheet, MatBottomSheetRef, MatTableDataSource, MAT_BOTTOM_SHEET_DATA, PageEvent } from "@angular/material";
import { Router } from "@angular/router";
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR, WHERE } from 'src/app/_helpers/filterBuilder';
import { Movement } from 'src/app/_models/movement';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { Student } from "src/app/_models/users/user";
import { GeneralService } from "src/app/_services/general.service";
import { HttpErrorResponseHandlerService } from "src/app/_services/http-error-response-handler.service";
import { CustomValidators } from "src/app/_validators/custom-validators";
import Swal from 'sweetalert2';
import { SedeService } from "../sede.service";
enum STEPS {
   LIST,
   CHARGE_BALANCE
}
@Component({
   selector: "bottom-charge-balance",
   templateUrl: "bottom-charge-balance.html"
})
export class BottomChargeBalance implements OnInit {
   @ViewChild("responseSwal", { static: true }) private responseSwal: SwalComponent;
   @ViewChild("questionSwal", { static: true }) private questionSwal: SwalComponent;
   updatedUser;
   chargeBalanceUser: any;
   /* Charge Balance Form */
   chargeBalanceForm: FormGroup;
   public readonly MONEY = "money";

   constructor(
      private _bottomSheetRef: MatBottomSheetRef<BottomChargeBalance>,
      @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
      private fb: FormBuilder,
      private sedeService: SedeService
   ) {
      this.chargeBalanceUser = data;
   }

   ngOnInit() {
      this.chargeBalanceForm = this.createChargeBalanceForm();
   }

   createChargeBalanceForm(): FormGroup {
      return this.fb.group({
         [this.MONEY]: ["", [CustomValidators.required("El campo es obligatorio"), CustomValidators.minValue(1, "La carga debe ser positiva")]]
      });
   }

   onCancelCharge() {
      this._bottomSheetRef.dismiss();
   }

   onConfirmSwal() {
      this._bottomSheetRef.dismiss(this.updatedUser);
   }

   onClickChargeBalance() {
      this.questionSwal.swalOptions = {
         title: "Carga de saldo",
         text: `¿Confirma que desea cargarle $${this.chargeBalanceForm.value.money} a ${this.chargeBalanceUser.display_name}?`,
         icon: "question",
         showConfirmButton: true,
         showCancelButton: true,
         confirmButtonText: "Confirmar",
         cancelButtonText: "Cancelar",
         preConfirm: () => {
            return this.chargeBalance().then(response => {
               this.updatedUser = response.data;
               console.log(this.updatedUser);
               Swal.fire({
                  title: "Carga de saldo exitosa",
                  text: response.message,
                  icon: "success",
                  showConfirmButton: true,
                  confirmButtonText: "Continuar",
               }).then(res => this.onConfirmSwal())
            }).catch(e => {
               Swal.fire({
                  title: "Carga de saldo",
                  text: "No se pudo realizar la carga, inténtelo nuevamente",
                  icon: "error",
                  showConfirmButton: true,
                  confirmButtonText: "Continuar"
               })
            })
         },
         allowOutsideClick: () => !Swal.isLoading()
      };
      setTimeout(() => {
         this.questionSwal.fire();
      }, 0);
   }

   chargeBalance(): Promise<any> {
      this.updatedUser = null;
      return this.sedeService.chargeBalance(this.chargeBalanceUser.id, this.chargeBalanceForm.value.money).toPromise();
   }

   openLink(event: MouseEvent): void {
      this._bottomSheetRef.dismiss();
      event.preventDefault();
   }
}

@Component({
   selector: "cei-charge-balance",
   templateUrl: "./charge-balance.component.html",
   styleUrls: ["./charge-balance.component.scss"]
})
export class ChargeBalanceComponent implements OnInit {
   public readonly TITLE = "Listado de estudiantes";
   public STEPS = STEPS;
   step: STEPS;
   students: Student[]; isLoadingGetStudents = false; _students: Subscription;
   dataSourceStudents;
   displayedColumns: string[] = ["dni", "fullname", "balance", "actions"];
   @ViewChild("responseSwal", { static: true }) private responseSwal: SwalComponent;
   swalOptions: any = {
      title: "Busqueda",
      text: "No se encontraron estudiantes",
      type: "warning",
      showConfirmButton: true,
      confirmButtonText: "Continuar"
   };
   @ViewChild('alertError', { static: true }) alertError;
   messageError: string;
   /* Find User Form */
   findUserForm: FormGroup;
   public readonly FULLNAME = "fullname";
   public readonly EMAIL = "email";
   public readonly DNI = "dni";

   // metadata from api
   metaDataStudents: MetadataAPI;
   linksStudents: LinksAPI;
   // metadata from ui
   pagination: Pagination;
   filter: OR | AND;
   sort: Sort[];
   fb: FilterBuilder;

   constructor(
      private _bottomSheet: MatBottomSheet,
      private generalService: GeneralService,
      private sedeService: SedeService,
      private formBuilder: FormBuilder,
      private cd: ChangeDetectorRef,
      public router: Router,
      private httpErrorResponseHandlerService: HttpErrorResponseHandlerService
   ) { }

   ngOnInit() {
      this.generalService.sendMessage({ title: this.TITLE });
      this.dataSourceStudents = new MatTableDataSource();
      this.findUserForm = this.createFindUserForm();
      this.step = this.STEPS.LIST;
      this.fb = new FilterBuilder();
      this.sort = [{ field: 'dni', sort: "ASC" }]
      this.pagination = { page: 0, limit: 10 }
      this.getStudents(this.filter, this.sort, this.pagination);
   }

   createFindUserForm(): FormGroup {
      return this.formBuilder.group({
         [this.FULLNAME]: [""],
         // [this.EMAIL]: [
         //     '',
         //     [
         //         CustomValidators.email('Ingrese un formato de email correcto')
         //     ]
         // ],
         [this.DNI]: [
            "",
            [
               //    CustomValidators.minLength(8, "Longitud de DNI incorrecta"),
               //    CustomValidators.maxLength(10, "Longitud de DNI incorrecta")
            ]
         ]
      });
   }

   onPaginatorEvent(event: PageEvent) {
      this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
      this.getStudents(this.filter, this.sort, this.pagination);
   }

   //    createChargeBalanceForm(): FormGroup {
   //       return this.fb.group({
   //          [this.MONEY]: ["", [CustomValidators.required("Ingrese el saldo a cargar")]]
   //       });
   //    }
   // getUsers() {
   //    console.log(this.findUserForm.value);
   //    this.sedeService
   //       .getStudents(
   //          this.findUserForm.value.name,
   //          this.findUserForm.value.surname,
   //          this.findUserForm.value.dni,
   //          this.findUserForm.value.email
   //       )
   //       .subscribe(
   //          users => {
   //             this.users = users;
   //             this.dataUsers = new MatTableDataSource(this.users);
   //             this.step = 1;
   //          },
   //          error => {
   //             // TODO ver como evitar el setTimeout
   //             setTimeout(() => this.responseSwal.fire(), 0);
   //          }
   //       );
   // }

   onSubmitStudents() {
      const wheres: WHERE[] = [];
      console.log(this.findUserForm);
      const dni = this.findUserForm.value.dni;
      const fullname = this.findUserForm.value.fullname;

      if (!!dni) {
         const where = this.fb.where('dni', OPERATORS.CONTAINS, dni)
         wheres.push(where)
      }
      if (!!fullname) {
         const where = this.fb.where('full_name', OPERATORS.CONTAINS, fullname)
         wheres.push(where)
      }
      this.filter = this.fb.and(...wheres);
      this.getStudents(this.filter, this.sort, this.pagination)
   }

   onClickChargeBalance(userId: number) {
      const chargeBalanceUser = this.dataSourceStudents.data.find(user => user.id === userId);
      this.openBottomSheet(chargeBalanceUser);
   }

   //    cancelCharge() {
   //       this.step = 0;
   //       this.chargeBalanceForm.reset();
   //       this.findUserForm.reset();
   //       this.chargeBalanceUser = null;
   //    }

   //    chargeBalance(balance: number) {
   //       this.sedeService.chargeBalance(this.chargeBalanceUser.id, this.chargeBalanceForm.value.money).subscribe(
   //          message => {
   //             this.swalOptions = {
   //                title: "Carga de saldo",
   //                text: message.message,
   //                type: "success",
   //                showConfirmButton: true,
   //                confirmButtonText: "Continuar"
   //             };
   //             // TODO ver como evitar el setTimeout
   //             setTimeout(() => this.responseSwal.fire(), 0);
   //             this.step = 0;
   //          },
   //          error => {
   //             this.swalOptions = {
   //                title: "Carga de saldo",
   //                text: "No se pudo realizar la carga",
   //                type: "danger",
   //                showConfirmButton: true,
   //                confirmButtonText: "Continuar"
   //             };
   //             // TODO ver como evitar el setTimeout
   //             setTimeout(() => this.responseSwal.fire(), 0);
   //          }
   //       );
   //    }

   openBottomSheet(user): void {
      // const data = { evolutions: attention.evolution, date: attention.date };
      const refBS = this._bottomSheet.open(BottomChargeBalance, { data: user });
      refBS.afterDismissed().subscribe((movement: Movement) => {
         this.updateUser({ ...user, balance: Number(user.balance) + Number(movement.amount) });
      });
   }

   updateUser(userUpdated) {
      // Using map & filter
      const studentUpdatedIndex = this.dataSourceStudents.data.findIndex(user => user.id == userUpdated.id);
      if (studentUpdatedIndex != -1) {
         const arr = this.dataSourceStudents.data;
         arr[studentUpdatedIndex] = userUpdated;
         this.dataSourceStudents.data = arr;
      }
      // Using splice
      // this.users.splice(
      //    this.users.findIndex(user => user.id == userUpdated.id),
      //    1,
      //    userUpdated
      // );
      // this.dataUsers = new MatTableDataSource(this.users);
   }

   // Services

   getStudents(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<Student[]> {
      this.isLoadingGetStudents = true;
      const promise: Promise<any> = new Promise((res, rej) => {
         this.sedeService.getStudents(filter, sort, pagination).pipe(
            finalize(() => {
               this.isLoadingGetStudents = false;
            })
         ).subscribe(
            (data) => { this.metaDataStudents = data.data.meta; this.linksStudents = data.data.links; this.dataSourceStudents.data = data.data.items; res(data.data.items) },
            (e) => { this.handleErrors(e); rej(e) },
         )
      })
      return from(promise);
   }

   handleErrors(err: HttpErrorResponse) {
      this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
      if (this.messageError) {
        this.alertError.openError(this.messageError);
      }
    }
}
