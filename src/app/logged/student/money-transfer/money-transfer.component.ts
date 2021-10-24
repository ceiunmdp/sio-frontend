import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef, MatTableDataSource, MAT_BOTTOM_SHEET_DATA, PageEvent } from '@angular/material';
import { Router } from '@angular/router';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { from, Observable, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AND, FilterBuilder, OPERATORS, OR } from 'src/app/_helpers/filterBuilder';
import { Pagination } from 'src/app/_models/pagination';
import { LinksAPI, MetadataAPI } from 'src/app/_models/response-api';
import { Sort } from 'src/app/_models/sort';
import { User } from 'src/app/_models/users/user';
import { MOVEMENTS } from 'src/app/_movements/movements';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { GeneralService } from 'src/app/_services/general.service';
import { HttpErrorResponseHandlerService } from 'src/app/_services/http-error-response-handler.service';
import { MovementService } from 'src/app/_services/movement.service';
import { CustomValidators } from 'src/app/_validators/custom-validators';
import Swal from 'sweetalert2';
import {AnimationOptions} from 'ngx-lottie';

@Component({
  selector: 'cei-money-transfer',
  templateUrl: './money-transfer.component.html',
  styleUrls: ['./money-transfer.component.scss']
})
export class MoneyTransferComponent implements OnInit {

  inputFilterValue = ''
  users: User[]; isLoadingGetUsers = false; _users: Subscription;
  isLoadingGetUserData = false;
  selectedUser;
  dataSourceUsers: MatTableDataSource<User>;
  displayedColumns: string[];
  promoteOrDegrade: any[] = [];
  public readonly MONEY = "money";
  displayedUsersColumns: string[] = [
    'name',
    'email',
    'dni',
    'actions'
  ];

  // metadata from api
  metaDataUsers: MetadataAPI;
  linksUsers: LinksAPI;
  currentUser;
  // metadata from ui
  pagination: Pagination;
  filter: OR | AND;
  sort: Sort[];
  fb: FilterBuilder;
  allUsersCheckbox;
  @ViewChild('alertError', { static: true }) alertError;
  messageError: string;
  noOrdersLottie: AnimationOptions = {
      path: 'assets/animations/empty-orders.json',
      loop: false
   };


  constructor(
    public router: Router,
    private httpErrorResponseHandlerService: HttpErrorResponseHandlerService,
    private authService: AuthenticationService,
    private generalService: GeneralService,
    private _bottomSheet: MatBottomSheet,
  ) { }

  ngOnInit() {
    this.fb = new FilterBuilder();
    this.getUserData().toPromise().catch(err => this.handleErrors(err));
    this.generalService.sendMessage({title: 'Transferencia de saldo'})
    this.dataSourceUsers = new MatTableDataSource();
    this.displayedColumns = this.displayedUsersColumns;
    this.filter = this.fb.and(this.fb.where('disabled', OPERATORS.IS, 'false'));
    this.allUsersCheckbox = false;
  }

  ngOnDestroy(): void {
    if(!!this._users) {
      this._users.unsubscribe();
    }
  }

  handleErrors(err: HttpErrorResponse) {
    this.messageError = this.httpErrorResponseHandlerService.handleError(this.router, err);
    if (this.messageError) {
      this.alertError.openError(this.messageError);
    }
  }

  getUserData(): Observable<any> {
    this.isLoadingGetUserData = true;
    this.authService.getUserData()
    const promise: Promise<any> = new Promise((res, rej) => {
      this.authService.getUserData().pipe(
        finalize(() => {
          this.isLoadingGetUserData = false;
          this.getUsers(this.filter, this.sort, this.pagination).toPromise().catch(err => this.handleErrors(err));;
        })
      ).subscribe(
        (data) => {
          this.currentUser = data
        },
        (e) => { rej(e) },
      )
    })
    return from(promise);
  }

  onPaginatorEvent(event: PageEvent) {
    this.pagination = { limit: event.pageSize, page: event.pageIndex + 1 }
    this.getUsers(this.filter, this.sort, this.pagination).toPromise().catch(err => this.handleErrors(err));
  }

  onRefresh(): Promise<void | User[]> {
    return this.getUsers(this.filter, this.sort, this.pagination).toPromise().catch(err => this.handleErrors(err));
  }

  displayTransferForm(user) {
    this.selectedUser = user;
    this.openBottomSheet(this.selectedUser);
  }

  openBottomSheet(toUser): void {
    // const data = { evolutions: attention.evolution, date: attention.date };
    const refBS = this._bottomSheet.open(
      BottomMoneyTransferComponent,
      {
        data: {
          fromUser: this.currentUser,
          toUser: toUser
        }
      }
    );
    refBS.afterDismissed().subscribe((refresh) => {
      if (refresh) window.location.reload();
    });
 }

  onSearch(st: string) {
    this.filter = this.fb.or(
      this.fb.where('full_name', OPERATORS.CONTAINS, st),
      this.fb.where('dni', OPERATORS.CONTAINS, st),
      this.fb.where('email', OPERATORS.CONTAINS, st)
    );
    this.getUsers(this.filter).toPromise().catch(err => this.handleErrors(err));
  }

  fromCreateOrEditToList(refresh = false) {
    this.selectedUser = null; // Reset selectedCourse
    if (refresh) this.onRefresh();
  }

  // Services

  getUsers(filter?: OR | AND, sort?: Sort[], pagination?: Pagination): Observable<User[]> {
    this.isLoadingGetUsers = true;
    const promise: Promise<any> = new Promise((res, rej) => {
      this._users = this.authService.getStudents(filter, sort, pagination).pipe(
        finalize(() => {
          this.isLoadingGetUsers = false;
        })
      ).subscribe(
        (data) => {
          this.metaDataUsers = { ...data.data.meta };
          this.linksUsers = data.data.links;
          this.dataSourceUsers.data = data.data.items.filter((student) => student.id !== this.currentUser.id);
          res(this.dataSourceUsers.data)
        },
        (e) => { rej(e) },
      )
    })
    return from(promise);
  }

}

@Component({
  selector: "bottom-money-transfer",
  templateUrl: "bottom-money-transfer.html"
})

export class BottomMoneyTransferComponent implements OnInit {
  @ViewChild("responseSwal", { static: true }) private responseSwal: SwalComponent;
  @ViewChild("questionSwal", { static: true }) private questionSwal: SwalComponent;
  updatedUser;
  transferMoneyUser: any;
  currentUser: any;
  transferForm: FormGroup;
  public readonly MONEY = "money";

  constructor(
     private _bottomSheetRef: MatBottomSheetRef<BottomMoneyTransferComponent>,
     @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
     private fb: FormBuilder,
     private authService: AuthenticationService,
     private movementsService: MovementService
  ) {
     this.transferMoneyUser = data.toUser;
     this.currentUser = data.fromUser;
  }

  ngOnInit() {
     this.transferForm = this.createMoneyTransferForm();
  }

  onCancelCharge() {
     this._bottomSheetRef.dismiss(false);
  }

  onConfirmSwal() {
     this._bottomSheetRef.dismiss(true);
  }

  onClickChargeBalance() {
     this.questionSwal.swalOptions = {
        title: "Transferencia de saldo",
        text: `¿Confirma que desea transferir $${this.transferForm.value.money} a ${this.transferMoneyUser.display_name}?`,
        icon: "question",
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
           return this.transferMoney().then(response => {
              this.updatedUser = response.data;
              Swal.fire({
                 title: "Transferencia de saldo exitosa",
                 text: response.message,
                 icon: "success",
                 showConfirmButton: true,
                 confirmButtonText: "Continuar",
              }).then(res => {this.onConfirmSwal(); this.authService.getAndUpdateUserData().toPromise()})
           }).catch(e => {
              Swal.fire({
                 title: "Carga de saldo",
                 text: "No se pudo realizar la transferencia, inténtelo nuevamente",
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

  createMoneyTransferForm(): FormGroup {
    return this.fb.group({
       [this.MONEY]: ["", [
          CustomValidators.required("El campo es obligatorio"),
          CustomValidators.minValue(1, "La carga debe ser positiva"),
          CustomValidators.maxValue(this.currentUser.balance, "No puede transferir mas que su saldo actual"),
      ]]
    });
  }

  transferMoney(): Promise<any> {
     return this.movementsService.createMovement(this.currentUser.id, this.transferMoneyUser.id, MOVEMENTS.TRANSFER , this.transferForm.value.money).toPromise();
  }

  openLink(event: MouseEvent): void {
     this._bottomSheetRef.dismiss(false);
     event.preventDefault();
  }

}
