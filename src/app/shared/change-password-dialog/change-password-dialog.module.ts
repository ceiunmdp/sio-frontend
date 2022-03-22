import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { MaterialModule } from 'src/app/material/material.module';
import { UtilsModule } from 'src/app/_utils/utils.module';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';


@NgModule({
  declarations: [ChangePasswordDialogComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    UtilsModule,
    MatIconModule,
  ],
  exports: [ChangePasswordDialogComponent],
  entryComponents: [ChangePasswordDialogComponent],
})
export class ChangePasswordDialogModule { }
