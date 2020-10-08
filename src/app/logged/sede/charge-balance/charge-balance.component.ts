import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { GeneralService } from "src/app/_services/general.service";
import { SedeService } from "../sede.service";
import { User } from "src/app/_models/users/user";
import { FormGroup, FormBuilder } from "@angular/forms";
import {
   MatTableDataSource,
   MAT_BOTTOM_SHEET_DATA,
   MatBottomSheetRef,
   MatBottomSheet,
   MatPaginator
} from "@angular/material";
import { CustomValidators } from "src/app/_validators/custom-validators";
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";

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
      // Setear this.chargeBalanceUser
      console.log(data);
   }

   ngOnInit() {
      this.chargeBalanceForm = this.createChargeBalanceForm();
   }

   createChargeBalanceForm(): FormGroup {
      return this.fb.group({
         [this.MONEY]: ["", [CustomValidators.required("El campo es obligatorio")]]
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
         text: `¿Confirma que desea cargarle $${this.chargeBalanceForm.value.money} a ${this.chargeBalanceUser.name} ${this.chargeBalanceUser.surname}?`,
         icon: "question",
         showConfirmButton: true,
         showCancelButton: true,
         confirmButtonText: "Confirmar",
         cancelButtonText: "Cancelar"
      };
      setTimeout(() => {
         this.questionSwal.fire();
      }, 0);
   }

   chargeBalance() {
      this.updatedUser = null;
      this.sedeService.chargeBalance(this.chargeBalanceUser.id, this.chargeBalanceForm.value.money).subscribe(
         response => {
            this.updatedUser = response.data;
            this.responseSwal.swalOptions = {
               title: "Carga de saldo",
               text: response.message,
               icon: "success",
               showConfirmButton: true,
               confirmButtonText: "Continuar"
            };
            console.log(this.responseSwal);

            // TODO ver como evitar el setTimeout
            setTimeout(() => this.responseSwal.fire(), 100);
         },
         error => {
            console.log("entro en error", error);
            this.responseSwal.swalOptions = {
               title: "Carga de saldo",
               text: "No se pudo realizar la carga, inténtelo nuevamente",
               icon: "error",
               showConfirmButton: true,
               confirmButtonText: "Continuar"
            };
            // TODO ver como evitar el setTimeout
            setTimeout(() => this.responseSwal.fire(), 0);
         }
      );
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
   private paginator: MatPaginator;
   @ViewChild(MatPaginator, { static: false }) set matPaginator(mp: MatPaginator) {
      mp && this.dataUsers ? ((this.paginator = mp), this.setDataSourceAttributes()) : null;
   }
   dataUsers;
   step: number;
   users: User[] = [];
   displayedColumns: string[] = ["id", "dni", "name", "surname", "balance", "actions"];
   @ViewChild("responseSwal", { static: true }) private responseSwal: SwalComponent;
   swalOptions: any = {
      title: "Busqueda",
      text: "No se encontraron estudiantes",
      type: "warning",
      showConfirmButton: true,
      confirmButtonText: "Continuar"
   };

   /* Find User Form */
   findUserForm: FormGroup;
   public readonly NAME = "name";
   public readonly SURNAME = "surname";
   public readonly EMAIL = "email";
   public readonly DNI = "dni";

   /* Charge Balance Form */
   //    chargeBalanceForm: FormGroup;
   //    public readonly MONEY = "money";

   constructor(
      private _bottomSheet: MatBottomSheet,
      private generalService: GeneralService,
      private sedeService: SedeService,
      private fb: FormBuilder
   ) { }

   ngOnInit() {
      this.generalService.sendMessage({ title: this.TITLE });
      this.findUserForm = this.createFindUserForm();
      this.step = 1;
   }

   setDataSourceAttributes() {
      this.dataUsers.paginator = this.paginator;
      this.paginator._intl.itemsPerPageLabel = "Registros por página";
      this.paginator._intl.firstPageLabel = "Primera página";
      this.paginator._intl.lastPageLabel = "Última páginaaa";
      this.paginator._intl.nextPageLabel = "Página siguiente";
      this.paginator._intl.previousPageLabel = "Página anterior";
   }

   createFindUserForm(): FormGroup {
      return this.fb.group({
         [this.NAME]: [""],
         [this.SURNAME]: [""],
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

   //    createChargeBalanceForm(): FormGroup {
   //       return this.fb.group({
   //          [this.MONEY]: ["", [CustomValidators.required("Ingrese el saldo a cargar")]]
   //       });
   //    }

   getUsers() {
      console.log(this.findUserForm.value);
      this.sedeService
         .getUsers(
            this.findUserForm.value.name,
            this.findUserForm.value.surname,
            this.findUserForm.value.dni,
            this.findUserForm.value.email
         )
         .subscribe(
            users => {
               this.users = users;
               this.dataUsers = new MatTableDataSource(this.users);
               this.step = 1;
            },
            error => {
               // TODO ver como evitar el setTimeout
               setTimeout(() => this.responseSwal.fire(), 0);
            }
         );
   }

   onClickChargeBalance(userId: number) {
      //   this.chargeBalanceForm = this.createChargeBalanceForm();
      const chargeBalanceUser = this.users.find(user => user.id === userId);
      //   this.step = 2;
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

   openBottomSheet(data): void {
      // const data = { evolutions: attention.evolution, date: attention.date };
      const refBS = this._bottomSheet.open(BottomChargeBalance, { data });
      refBS.afterDismissed().subscribe(userUpdated => {
         console.log("Bottom sheet has been dismissed.", userUpdated);
         this.updateUser(userUpdated);
      });
   }

   updateUser(userUpdated) {
      // Using map & filter
      this.users[this.users.findIndex(user => user.id == userUpdated.id)] = userUpdated;
      // Using splice
      // this.users.splice(
      //    this.users.findIndex(user => user.id == userUpdated.id),
      //    1,
      //    userUpdated
      // );
      this.dataUsers = new MatTableDataSource(this.users);
   }
}
