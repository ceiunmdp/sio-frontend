import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule, MatListModule, MatToolbarModule } from '@angular/material';
import { FooterComponent } from './footer/footer.component';

@NgModule({
   imports: [CommonModule, MatListModule, MatIconModule, FlexLayoutModule, MatToolbarModule],
   declarations: [FooterComponent],
   exports: [FooterComponent]
})
export class SectionsModule {}
