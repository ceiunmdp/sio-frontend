import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { MaterialModule } from 'src/app/material/material.module';
import { UtilsModule } from 'src/app/_utils/utils.module';
import { ProfileDialogComponent } from './profile-dialog.component';



@NgModule({
  declarations: [ProfileDialogComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    UtilsModule,
    MatIconModule,
  ],
  exports: [ProfileDialogComponent],
  entryComponents: [ProfileDialogComponent]
})
export class ProfileDialogModule { }
