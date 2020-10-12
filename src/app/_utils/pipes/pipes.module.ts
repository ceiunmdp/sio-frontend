import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StringFilterByPipe } from './string-filter-by-pipe.pipe';



@NgModule({
  declarations: [StringFilterByPipe],
  imports: [
    CommonModule
  ],
  exports: [
    StringFilterByPipe
  ]
})
export class PipesModule { }
