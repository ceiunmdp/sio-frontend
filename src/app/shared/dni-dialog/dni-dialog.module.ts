import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { MaterialModule } from 'src/app/material/material.module';
import { UtilsModule } from 'src/app/_utils/utils.module';
import { DniDialogComponent } from './dni-dialog.component';



@NgModule({
  declarations: [DniDialogComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    UtilsModule,
    MatIconModule,
  ],
  exports: [DniDialogComponent],
  entryComponents: [DniDialogComponent],
})
export class DniDialogModule { }
