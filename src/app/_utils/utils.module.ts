import { SelectSearchingDynamicInputComponent } from './forms/select-searching-dynamic-input/select-searching-dynamic-input.component';
import { FilePondModule } from 'ngx-filepond';
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import {
   MatIconModule,
   MatSelectModule,
   MatFormFieldModule,
   MatBottomSheetModule,
   MatTabsModule,
   MatMenuModule,
   MatRadioModule,
   MatPaginatorModule,
   MatCheckboxModule,
   MatTooltipModule,
   MatDividerModule
} from "@angular/material";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { CardIconComponent } from "./card-icon/card-icon.component";
import { ToggleThemeComponent } from "./extras/toggle-theme/toggle-theme.component";
import { AlertComponent } from "./forms/alert/alert.component";
import { FormElementComponent } from "./forms/form-element/form-element.component";
import { InputTextComponent } from "./forms/input-text/input-text.component";
import { MonedaPipe } from "./moneda.pipe";
import { AlertErrorComponent } from "./forms/alert-error/alert-error.component";
import { AlertErrorChildComponent } from "./forms/alert-error/alert-error-child/alert-error-child.component";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { CheckboxInputComponent } from "./forms/checkbox-input/checkbox-input.component";
import { EmailInputComponent } from "./forms/email-input/email-input.component";
import { FileInputComponent } from "./forms/file-input/file-input.component";
import { NumberInputComponent } from "./forms/number-input/number-input.component";
import { PasswordInputComponent } from "./forms/password-input/password-input.component";
import { SelectInputComponent } from "./forms/select-input/select-input.component";
import { TextInputComponent } from "./forms/text-input/text-input.component";
import { MatButtonModule } from "@angular/material/button";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { SpinnerErrorComponent } from './spinner-error/spinner-error.component';
import { MultiSelectInputComponent } from './forms/multi-select-input/multi-select-input.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { LottieModule } from 'ngx-lottie';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import player from 'lottie-web';
import { TextSearchingInputComponent } from './forms/text-searching-input/text-searching-input.component';
import { CardTableComponent } from './card-table/card-table.component';
export function playerFactory() {
   return player;
}
@NgModule({
   declarations: [
      InputTextComponent,
      FormElementComponent,
      ToggleThemeComponent,
      CardIconComponent,
      AlertComponent,
      MonedaPipe,
      AlertErrorComponent,
      AlertErrorChildComponent,
      CheckboxInputComponent,
      EmailInputComponent,
      FileInputComponent,
      NumberInputComponent,
      PasswordInputComponent,
      SelectInputComponent,
      TextInputComponent,
      SpinnerErrorComponent,
      SpinnerComponent,
      SelectSearchingDynamicInputComponent,
      MultiSelectInputComponent,
      TextSearchingInputComponent,
      CardTableComponent,
   ],
   imports: [
      CommonModule,
      MatInputModule,
      ReactiveFormsModule,
      FlexLayoutModule,
      MatSelectModule,
      MatSlideToggleModule,
      MatIconModule,
      MatCardModule,
      MatSnackBarModule,
      MatButtonModule,
      MatFormFieldModule,
      MatBottomSheetModule,
      MatTabsModule,
      MatMenuModule,
      MatRadioModule,
      SweetAlert2Module,
      FilePondModule,
      FormsModule,
      NgxMatSelectSearchModule,
      MatPaginatorModule,
      MatCheckboxModule,
      MatTooltipModule,
      MatDividerModule,
      LottieModule.forRoot({ player: playerFactory })
   ],
   exports: [
      InputTextComponent,
      ToggleThemeComponent,
      CardIconComponent,
      AlertComponent,
      MonedaPipe,
      AlertErrorComponent,
      AlertErrorChildComponent,
      EmailInputComponent,
      PasswordInputComponent,
      CheckboxInputComponent,
      NumberInputComponent,
      SelectInputComponent,
      TextInputComponent,
      SpinnerErrorComponent,
      SpinnerComponent,
      FileInputComponent,
      SelectSearchingDynamicInputComponent,
      MultiSelectInputComponent,
      TextSearchingInputComponent,
      CardTableComponent,

   ],
   entryComponents: [AlertErrorComponent]
})
export class UtilsModule { }
