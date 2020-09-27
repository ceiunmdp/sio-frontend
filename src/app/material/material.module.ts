import { NgModule } from '@angular/core';
import {
   MatButtonModule,
   MatFormFieldModule,
   MatIconModule,
   MatInputModule,
   MatNativeDateModule,
   MatSelectModule,
   MatTabsModule,
   MatDatepickerModule,
   MatCardModule,
   MatToolbarModule,
   MatSidenavModule,
   MatMenuModule,
   MatListModule,
   MatTableModule,
   MatTooltipModule,
   MatBottomSheetModule,
   MatExpansionModule,
   MatBadgeModule,
   MatSortModule,
   MatDividerModule,
   MatRadioModule,
   MatCheckboxModule,
   MatPaginatorModule,
   MatSnackBarModule,
   MatButtonToggleModule,
   MatDialogModule,
   MatProgressSpinnerModule,
   MatChipsModule,
   MatAutocompleteModule,
   MatTreeModule
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UtilsModule } from '../_utils/utils.module';

const material = [
   MatButtonModule,
   MatCardModule,
   MatNativeDateModule,
   MatTabsModule,
   MatSelectModule,
   MatDividerModule,
   MatInputModule,
   MatIconModule,
   MatFormFieldModule,
   ReactiveFormsModule,
   MatDatepickerModule,
   MatToolbarModule,
   MatSidenavModule,
   MatRadioModule,
   MatCheckboxModule,
   MatMenuModule,
   MatListModule,
   MatTableModule,
   MatTooltipModule,
   MatBottomSheetModule,
   MatExpansionModule,
   MatBadgeModule,
   MatSortModule,
   MatPaginatorModule,
   MatSnackBarModule,
   MatButtonToggleModule,
   MatDialogModule,
   MatProgressSpinnerModule,
   MatChipsModule,
   MatAutocompleteModule,
   MatTreeModule,
];

const flexLayout = [FlexLayoutModule, UtilsModule];

@NgModule({
   imports: [material, flexLayout],
   exports: [material, flexLayout],
})
export class MaterialModule { }
